#!/usr/bin/env bash
# Cloudflare Quick Tunnel management script (tmux-based)
# Usage: tunnel.sh <command> [args]

set -euo pipefail

TUNNEL_STATE_DIR="${HOME}/.cloudflare-tunnels"
TMUX_PREFIX="cftunnel"
MAX_TUNNELS="${TUNNEL_MAX_CONCURRENT:-5}"
DEFAULT_TTL="2h"

mkdir -p "$TUNNEL_STATE_DIR"

# --- Helpers ---

_tmux_session_name() {
  echo "${TMUX_PREFIX}-${1}"
}

_tmux_session_exists() {
  tmux has-session -t "$(_tmux_session_name "$1")" 2>/dev/null
}

_parse_ttl() {
  local ttl="$1"
  case "$ttl" in
    forever|none|0) echo "forever" ;;
    *h) echo $(( ${ttl%h} * 3600 )) ;;
    *m) echo $(( ${ttl%m} * 60 )) ;;
    *s) echo "${ttl%s}" ;;
    *) echo "invalid"; return 1 ;;
  esac
}

_count_active_tunnels() {
  local count=0
  for pid_file in "${TUNNEL_STATE_DIR}"/tunnel-*.pid; do
    [[ -f "$pid_file" ]] || continue
    local p
    p=$(basename "$pid_file" .pid)
    local port="${p#tunnel-}"
    local pid
    pid=$(cat "$pid_file")
    if _tmux_session_exists "$port" && kill -0 "$pid" 2>/dev/null; then
      count=$((count + 1))
    fi
  done
  echo "$count"
}

_cleanup_stale() {
  for pid_file in "${TUNNEL_STATE_DIR}"/tunnel-*.pid; do
    [[ -f "$pid_file" ]] || continue
    local p
    p=$(basename "$pid_file" .pid)
    local port="${p#tunnel-}"
    local pid
    pid=$(cat "$pid_file")

    if ! _tmux_session_exists "$port" || ! kill -0 "$pid" 2>/dev/null; then
      _force_cleanup "$port"
    fi
  done
}

_force_cleanup() {
  local port="$1"
  local session
  session=$(_tmux_session_name "$port")
  local pid_file="${TUNNEL_STATE_DIR}/tunnel-${port}.pid"

  # Kill cloudflared process if still running
  if [[ -f "$pid_file" ]]; then
    local pid
    pid=$(cat "$pid_file")
    kill "$pid" 2>/dev/null || true
  fi

  # Kill tmux session if it exists
  tmux kill-session -t "$session" 2>/dev/null || true

  # Remove all state files
  rm -f "${TUNNEL_STATE_DIR}/tunnel-${port}.pid" \
        "${TUNNEL_STATE_DIR}/tunnel-${port}.url" \
        "${TUNNEL_STATE_DIR}/tunnel-${port}.log" \
        "${TUNNEL_STATE_DIR}/tunnel-${port}.ttl"
}

# --- Commands ---

cmd_start() {
  local port="${1:?Usage: tunnel.sh start <port> [--protocol http|https] [--ttl 2h|30m|forever]}"
  local protocol="http"
  local ttl="$DEFAULT_TTL"

  shift
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --protocol) protocol="$2"; shift 2 ;;
      --ttl) ttl="$2"; shift 2 ;;
      *) echo "Unknown option: $1"; exit 1 ;;
    esac
  done

  # Validate TTL
  local ttl_seconds
  ttl_seconds=$(_parse_ttl "$ttl") || { echo "Invalid TTL: ${ttl}. Use e.g. 2h, 30m, forever."; exit 1; }

  # Clean up stale tunnels first
  _cleanup_stale

  # Check if tunnel already running on this port
  if [[ -f "${TUNNEL_STATE_DIR}/tunnel-${port}.pid" ]]; then
    local existing_pid
    existing_pid=$(cat "${TUNNEL_STATE_DIR}/tunnel-${port}.pid")
    if _tmux_session_exists "$port" && kill -0 "$existing_pid" 2>/dev/null; then
      echo "Tunnel already running on port ${port} (PID: ${existing_pid})"
      echo "URL: $(cat "${TUNNEL_STATE_DIR}/tunnel-${port}.url" 2>/dev/null || echo 'unknown')"
      echo "Session: $(_tmux_session_name "$port")"
      exit 0
    else
      _force_cleanup "$port"
    fi
  fi

  # Check concurrent tunnel limit
  local active
  active=$(_count_active_tunnels)
  if [[ "$active" -ge "$MAX_TUNNELS" ]]; then
    echo "Error: Maximum of ${MAX_TUNNELS} concurrent tunnels reached."
    echo "Active tunnels:"
    cmd_list
    echo ""
    echo "Stop a tunnel first: tunnel.sh stop <port>"
    exit 1
  fi

  local url="${protocol}://localhost:${port}"
  local log_file="${TUNNEL_STATE_DIR}/tunnel-${port}.log"
  local pid_file="${TUNNEL_STATE_DIR}/tunnel-${port}.pid"
  local url_file="${TUNNEL_STATE_DIR}/tunnel-${port}.url"
  local ttl_file="${TUNNEL_STATE_DIR}/tunnel-${port}.ttl"
  local session
  session=$(_tmux_session_name "$port")

  # Clear old log file
  > "$log_file"

  # Store TTL info
  if [[ "$ttl_seconds" == "forever" ]]; then
    echo "forever" > "$ttl_file"
  else
    echo "$(($(date +%s) + ttl_seconds))" > "$ttl_file"
  fi

  echo "Starting tunnel to ${url} (TTL: ${ttl})..."

  # Build the command to run inside the tmux session.
  # cloudflared is backgrounded so we can capture its PID, then we wait on it.
  # For TTL, a background sleep+kill auto-shuts down the tunnel.
  local tmux_cmd
  if [[ "$ttl_seconds" == "forever" ]]; then
    tmux_cmd="cloudflared tunnel --url '${url}' > '${log_file}' 2>&1 & CF_PID=\$!; echo \$CF_PID > '${pid_file}'; wait \$CF_PID"
  else
    tmux_cmd="cloudflared tunnel --url '${url}' > '${log_file}' 2>&1 & CF_PID=\$!; echo \$CF_PID > '${pid_file}'; (sleep ${ttl_seconds} && kill \$CF_PID 2>/dev/null) & wait \$CF_PID"
  fi

  tmux new-session -d -s "$session" "$tmux_cmd"

  # Wait for PID file to be written (tmux start is async)
  local pid_attempts=0
  while [[ ! -s "$pid_file" ]] && [[ $pid_attempts -lt 20 ]]; do
    sleep 0.2
    pid_attempts=$((pid_attempts + 1))
  done

  if [[ ! -s "$pid_file" ]]; then
    echo "Error: Failed to start tunnel (PID file not created)."
    tmux kill-session -t "$session" 2>/dev/null || true
    rm -f "$pid_file" "$url_file" "$log_file" "$ttl_file"
    exit 1
  fi

  local pid
  pid=$(cat "$pid_file")

  # Wait for the tunnel URL to appear in logs (up to 15 seconds)
  local attempts=0
  local tunnel_url=""
  while [[ $attempts -lt 30 ]]; do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "Error: cloudflared exited unexpectedly. Check logs:"
      cat "$log_file"
      _force_cleanup "$port"
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
    echo "Session: ${session}"
    echo "Check logs: ${log_file}"
  else
    echo "$tunnel_url" > "$url_file"
    echo "Tunnel running!"
    echo "  URL: ${tunnel_url}"
    echo "  PID: ${pid}"
    echo "  Port: ${port}"
    echo "  Session: ${session}"
    echo "  TTL: ${ttl}"
  fi
}

cmd_stop() {
  local port="${1:-}"

  if [[ -z "$port" ]]; then
    # Stop all tunnels
    local found=false
    for pid_file in "${TUNNEL_STATE_DIR}"/tunnel-*.pid; do
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
  local pid_file="${TUNNEL_STATE_DIR}/tunnel-${port}.pid"
  local session
  session=$(_tmux_session_name "$port")

  if [[ ! -f "$pid_file" ]] && ! _tmux_session_exists "$port"; then
    echo "No tunnel found on port ${port}."
    return 1
  fi

  local pid=""
  if [[ -f "$pid_file" ]]; then
    pid=$(cat "$pid_file")
  fi

  # Kill the cloudflared process
  if [[ -n "$pid" ]] && kill "$pid" 2>/dev/null; then
    echo "Stopped tunnel on port ${port} (PID: ${pid})"
  else
    echo "Tunnel on port ${port} was not running (stale PID: ${pid:-unknown})"
  fi

  # Kill the tmux session
  tmux kill-session -t "$session" 2>/dev/null || true

  # Clean up all state files
  rm -f "${TUNNEL_STATE_DIR}/tunnel-${port}.pid" \
        "${TUNNEL_STATE_DIR}/tunnel-${port}.url" \
        "${TUNNEL_STATE_DIR}/tunnel-${port}.log" \
        "${TUNNEL_STATE_DIR}/tunnel-${port}.ttl"
}

cmd_list() {
  local found=false
  for pid_file in "${TUNNEL_STATE_DIR}"/tunnel-*.pid; do
    [[ -f "$pid_file" ]] || continue
    local p
    p=$(basename "$pid_file" .pid)
    local port="${p#tunnel-}"
    local pid
    pid=$(cat "$pid_file")
    local url
    url=$(cat "${TUNNEL_STATE_DIR}/tunnel-${port}.url" 2>/dev/null || echo "unknown")
    local session
    session=$(_tmux_session_name "$port")

    if _tmux_session_exists "$port" && kill -0 "$pid" 2>/dev/null; then
      found=true
      local ttl_info="unknown"
      if [[ -f "${TUNNEL_STATE_DIR}/tunnel-${port}.ttl" ]]; then
        local ttl_val
        ttl_val=$(cat "${TUNNEL_STATE_DIR}/tunnel-${port}.ttl")
        if [[ "$ttl_val" == "forever" ]]; then
          ttl_info="forever"
        else
          local now remaining
          now=$(date +%s)
          remaining=$((ttl_val - now))
          if [[ $remaining -le 0 ]]; then
            ttl_info="expired"
          elif [[ $remaining -ge 3600 ]]; then
            ttl_info="$((remaining / 3600))h $((remaining % 3600 / 60))m remaining"
          else
            ttl_info="$((remaining / 60))m remaining"
          fi
        fi
      fi
      echo "Port ${port} | PID ${pid} | Session ${session} | TTL ${ttl_info} | URL ${url}"
    else
      # Clean up stale entry
      _force_cleanup "$port"
    fi
  done

  if [[ "$found" == false ]]; then
    echo "No active tunnels."
  fi
}

cmd_status() {
  local port="${1:?Usage: tunnel.sh status <port>}"
  local pid_file="${TUNNEL_STATE_DIR}/tunnel-${port}.pid"
  local session
  session=$(_tmux_session_name "$port")

  if [[ ! -f "$pid_file" ]]; then
    echo "No tunnel found on port ${port}."
    exit 1
  fi

  local pid
  pid=$(cat "$pid_file")
  local url
  url=$(cat "${TUNNEL_STATE_DIR}/tunnel-${port}.url" 2>/dev/null || echo "unknown")

  if _tmux_session_exists "$port" && kill -0 "$pid" 2>/dev/null; then
    echo "Tunnel on port ${port} is running."
    echo "  PID: ${pid}"
    echo "  URL: ${url}"
    echo "  Session: ${session}"
    if [[ -f "${TUNNEL_STATE_DIR}/tunnel-${port}.ttl" ]]; then
      local ttl_val
      ttl_val=$(cat "${TUNNEL_STATE_DIR}/tunnel-${port}.ttl")
      if [[ "$ttl_val" == "forever" ]]; then
        echo "  TTL: forever"
      else
        local now remaining
        now=$(date +%s)
        remaining=$((ttl_val - now))
        if [[ $remaining -le 0 ]]; then
          echo "  TTL: expired (shutting down soon)"
        elif [[ $remaining -ge 3600 ]]; then
          echo "  TTL: $((remaining / 3600))h $((remaining % 3600 / 60))m remaining"
        else
          echo "  TTL: $((remaining / 60))m remaining"
        fi
      fi
    fi
  else
    echo "Tunnel on port ${port} is not running (stale entry). Cleaning up."
    _force_cleanup "$port"
  fi
}

cmd_logs() {
  local port="${1:?Usage: tunnel.sh logs <port>}"
  local log_file="${TUNNEL_STATE_DIR}/tunnel-${port}.log"

  if [[ ! -f "$log_file" ]]; then
    echo "No logs found for port ${port}."
    exit 1
  fi

  cat "$log_file"
}

cmd_gc() {
  echo "Running garbage collection..."
  local cleaned=0

  # 1. Clean up stale state files (tmux session or process is dead)
  for pid_file in "${TUNNEL_STATE_DIR}"/tunnel-*.pid; do
    [[ -f "$pid_file" ]] || continue
    local p
    p=$(basename "$pid_file" .pid)
    local port="${p#tunnel-}"
    local pid
    pid=$(cat "$pid_file")
    if ! _tmux_session_exists "$port" || ! kill -0 "$pid" 2>/dev/null; then
      echo "  Removing stale tunnel state for port ${port}"
      _force_cleanup "$port"
      cleaned=$((cleaned + 1))
    fi
  done

  # 2. Find orphaned tmux sessions matching our prefix but not tracked in state
  local sessions
  sessions=$(tmux list-sessions -F '#{session_name}' 2>/dev/null || true)
  while IFS= read -r session; do
    [[ -n "$session" ]] || continue
    if [[ "$session" == "${TMUX_PREFIX}-"* ]]; then
      local port="${session#${TMUX_PREFIX}-}"
      if [[ ! -f "${TUNNEL_STATE_DIR}/tunnel-${port}.pid" ]]; then
        echo "  Killing orphaned tmux session: ${session}"
        tmux kill-session -t "$session" 2>/dev/null || true
        cleaned=$((cleaned + 1))
      fi
    fi
  done <<< "$sessions"

  # 3. Find orphaned cloudflared processes running inside our tmux sessions
  #    but not tracked in state. Only targets processes whose parent is a
  #    cftunnel-* tmux session to avoid killing unrelated cloudflared instances.
  local tracked_pids=()
  for pid_file in "${TUNNEL_STATE_DIR}"/tunnel-*.pid; do
    [[ -f "$pid_file" ]] || continue
    tracked_pids+=("$(cat "$pid_file")")
  done

  # Get PIDs of processes inside our tmux sessions
  local tmux_sessions
  tmux_sessions=$(tmux list-sessions -F '#{session_name}' 2>/dev/null || true)
  while IFS= read -r session; do
    [[ -n "$session" ]] || continue
    if [[ "$session" == "${TMUX_PREFIX}-"* ]]; then
      local pane_pid
      pane_pid=$(tmux list-panes -t "$session" -F '#{pane_pid}' 2>/dev/null || true)
      [[ -n "$pane_pid" ]] || continue
      # Check children of the pane shell for cloudflared
      while IFS= read -r child_pid; do
        [[ -n "$child_pid" ]] || continue
        local is_tracked=false
        for tp in "${tracked_pids[@]+"${tracked_pids[@]}"}"; do
          if [[ "$tp" == "$child_pid" ]]; then
            is_tracked=true
            break
          fi
        done
        if [[ "$is_tracked" == false ]]; then
          echo "  Killing orphaned cloudflared process: PID ${child_pid} (session: ${session})"
          kill "$child_pid" 2>/dev/null || true
          cleaned=$((cleaned + 1))
        fi
      done < <(pgrep -P "$pane_pid" -f 'cloudflared' 2>/dev/null || true)
    fi
  done <<< "$tmux_sessions"

  if [[ $cleaned -eq 0 ]]; then
    echo "No orphans found. Everything is clean."
  else
    echo "Cleaned up ${cleaned} orphaned resource(s)."
  fi
}

# --- Main ---

case "${1:-help}" in
  start)      shift; cmd_start "$@" ;;
  stop)       shift; cmd_stop "$@" ;;
  list)       shift; cmd_list "$@" ;;
  status)     shift; cmd_status "$@" ;;
  logs)       shift; cmd_logs "$@" ;;
  gc|cleanup) shift; cmd_gc "$@" ;;
  help)
    echo "Usage: tunnel.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  start <port> [--protocol http|https] [--ttl 2h|30m|forever]  Start a quick tunnel"
    echo "  stop [port]                                                   Stop tunnel (or all)"
    echo "  list                                                          List active tunnels"
    echo "  status <port>                                                 Check tunnel status"
    echo "  logs <port>                                                   Show tunnel logs"
    echo "  gc                                                            Clean up orphaned tunnels"
    ;;
  *) echo "Unknown command: $1. Run 'tunnel.sh help' for usage."; exit 1 ;;
esac
