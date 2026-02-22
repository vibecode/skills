#!/usr/bin/env bash
# Cloudflare Quick Tunnel management script
# Usage: tunnel.sh <command> [args]

set -euo pipefail

TUNNEL_PID_DIR="${HOME}/.cloudflare-tunnels"
mkdir -p "$TUNNEL_PID_DIR"

cmd_start() {
  local port="${1:?Usage: tunnel.sh start <port> [--protocol http|https]}"
  local protocol="http"

  shift
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --protocol) protocol="$2"; shift 2 ;;
      *) echo "Unknown option: $1"; exit 1 ;;
    esac
  done

  local url="${protocol}://localhost:${port}"
  local log_file="${TUNNEL_PID_DIR}/tunnel-${port}.log"

  # Check if tunnel already running on this port
  if [[ -f "${TUNNEL_PID_DIR}/tunnel-${port}.pid" ]]; then
    local existing_pid
    existing_pid=$(cat "${TUNNEL_PID_DIR}/tunnel-${port}.pid")
    if kill -0 "$existing_pid" 2>/dev/null; then
      echo "Tunnel already running on port ${port} (PID: ${existing_pid})"
      echo "URL: $(cat "${TUNNEL_PID_DIR}/tunnel-${port}.url" 2>/dev/null || echo 'unknown')"
      exit 0
    else
      # Stale PID file, clean up
      rm -f "${TUNNEL_PID_DIR}/tunnel-${port}.pid" "${TUNNEL_PID_DIR}/tunnel-${port}.url" "${TUNNEL_PID_DIR}/tunnel-${port}.log"
    fi
  fi

  echo "Starting tunnel to ${url}..."
  cloudflared tunnel --url "$url" > "$log_file" 2>&1 &
  local pid=$!
  echo "$pid" > "${TUNNEL_PID_DIR}/tunnel-${port}.pid"

  # Wait for the tunnel URL to appear in logs (up to 15 seconds)
  local attempts=0
  local tunnel_url=""
  while [[ $attempts -lt 30 ]]; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "Error: cloudflared exited unexpectedly. Check logs:"
      cat "$log_file"
      rm -f "${TUNNEL_PID_DIR}/tunnel-${port}.pid"
      exit 1
    fi
    tunnel_url=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' "$log_file" 2>/dev/null | head -1 || true)
    if [[ -n "$tunnel_url" ]]; then
      break
    fi
    sleep 0.5
    attempts=$((attempts + 1))
  done

  if [[ -z "$tunnel_url" ]]; then
    echo "Warning: Could not detect tunnel URL within 15s. Tunnel may still be starting."
    echo "PID: ${pid}"
    echo "Check logs: ${log_file}"
  else
    echo "$tunnel_url" > "${TUNNEL_PID_DIR}/tunnel-${port}.url"
    echo "Tunnel running!"
    echo "  URL: ${tunnel_url}"
    echo "  PID: ${pid}"
    echo "  Port: ${port}"
  fi
}

cmd_stop() {
  local port="${1:-}"

  if [[ -z "$port" ]]; then
    # Stop all tunnels
    local found=false
    for pid_file in "${TUNNEL_PID_DIR}"/tunnel-*.pid; do
      [[ -f "$pid_file" ]] || continue
      found=true
      local p
      p=$(basename "$pid_file" .pid)
      port="${p#tunnel-}"
      _stop_one "$port"
    done
    if [[ "$found" == false ]]; then
      echo "No active tunnels found."
    fi
  else
    _stop_one "$port"
  fi
}

_stop_one() {
  local port="$1"
  local pid_file="${TUNNEL_PID_DIR}/tunnel-${port}.pid"

  if [[ ! -f "$pid_file" ]]; then
    echo "No tunnel found on port ${port}."
    return 1
  fi

  local pid
  pid=$(cat "$pid_file")
  if kill "$pid" 2>/dev/null; then
    echo "Stopped tunnel on port ${port} (PID: ${pid})"
  else
    echo "Tunnel on port ${port} was not running (stale PID: ${pid})"
  fi
  rm -f "${TUNNEL_PID_DIR}/tunnel-${port}.pid" "${TUNNEL_PID_DIR}/tunnel-${port}.url" "${TUNNEL_PID_DIR}/tunnel-${port}.log"
}

cmd_list() {
  local found=false
  for pid_file in "${TUNNEL_PID_DIR}"/tunnel-*.pid; do
    [[ -f "$pid_file" ]] || continue
    local p
    p=$(basename "$pid_file" .pid)
    local port="${p#tunnel-}"
    local pid
    pid=$(cat "$pid_file")
    local url
    url=$(cat "${TUNNEL_PID_DIR}/tunnel-${port}.url" 2>/dev/null || echo "unknown")

    if kill -0 "$pid" 2>/dev/null; then
      found=true
      echo "Port ${port} | PID ${pid} | URL ${url}"
    else
      # Clean up stale entry
      rm -f "${TUNNEL_PID_DIR}/tunnel-${port}.pid" "${TUNNEL_PID_DIR}/tunnel-${port}.url" "${TUNNEL_PID_DIR}/tunnel-${port}.log"
    fi
  done

  if [[ "$found" == false ]]; then
    echo "No active tunnels."
  fi
}

cmd_status() {
  local port="${1:?Usage: tunnel.sh status <port>}"
  local pid_file="${TUNNEL_PID_DIR}/tunnel-${port}.pid"

  if [[ ! -f "$pid_file" ]]; then
    echo "No tunnel found on port ${port}."
    exit 1
  fi

  local pid
  pid=$(cat "$pid_file")
  local url
  url=$(cat "${TUNNEL_PID_DIR}/tunnel-${port}.url" 2>/dev/null || echo "unknown")

  if kill -0 "$pid" 2>/dev/null; then
    echo "Tunnel on port ${port} is running."
    echo "  PID: ${pid}"
    echo "  URL: ${url}"
  else
    echo "Tunnel on port ${port} is not running (stale entry). Cleaning up."
    rm -f "${TUNNEL_PID_DIR}/tunnel-${port}.pid" "${TUNNEL_PID_DIR}/tunnel-${port}.url" "${TUNNEL_PID_DIR}/tunnel-${port}.log"
  fi
}

cmd_logs() {
  local port="${1:?Usage: tunnel.sh logs <port>}"
  local log_file="${TUNNEL_PID_DIR}/tunnel-${port}.log"

  if [[ ! -f "$log_file" ]]; then
    echo "No logs found for port ${port}."
    exit 1
  fi

  cat "$log_file"
}

case "${1:-help}" in
  start)  shift; cmd_start "$@" ;;
  stop)   shift; cmd_stop "$@" ;;
  list)   shift; cmd_list "$@" ;;
  status) shift; cmd_status "$@" ;;
  logs)   shift; cmd_logs "$@" ;;
  help)
    echo "Usage: tunnel.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  start <port> [--protocol http|https]  Start a quick tunnel"
    echo "  stop [port]                           Stop tunnel (or all if no port)"
    echo "  list                                  List active tunnels"
    echo "  status <port>                         Check tunnel status"
    echo "  logs <port>                           Show tunnel logs"
    ;;
  *) echo "Unknown command: $1. Run 'tunnel.sh help' for usage."; exit 1 ;;
esac
