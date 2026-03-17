#!/usr/bin/env bash
# Test suite for tunnel.sh — uses REAL cloudflared tunnels.
# Spins up a local python HTTP server per test and creates actual quick tunnels.
# Tests take ~20s each due to tunnel startup time.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TUNNEL_SH="${SCRIPT_DIR}/tunnel.sh"

# --- Test infrastructure ---

TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
FAIL_MESSAGES=()
HTTP_PIDS=()

# Use a separate HOME so we don't pollute the real ~/.cloudflare-tunnels
TEST_HOME=$(mktemp -d)
export HOME="$TEST_HOME"

# Lower the concurrent limit for testing
export TUNNEL_MAX_CONCURRENT=2

# Ports we'll use (pick high ports unlikely to conflict)
PORT_A=18771
PORT_B=18772
PORT_C=18773

# --- Prerequisite checks ---

if ! command -v tmux &>/dev/null; then
  echo "ERROR: tmux is required but not installed."
  exit 1
fi

if ! command -v cloudflared &>/dev/null; then
  echo "ERROR: cloudflared is required but not installed."
  exit 1
fi

start_http_server() {
  local port="$1"
  python3 -m http.server "$port" --bind 127.0.0.1 > /dev/null 2>&1 &
  HTTP_PIDS+=($!)
  # Give the server a moment to bind
  sleep 0.3
}

stop_http_servers() {
  for pid in "${HTTP_PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  HTTP_PIDS=()
}

cleanup() {
  echo ""
  echo "Cleaning up..."
  # Stop all tunnels (handles tmux sessions and state files)
  bash "$TUNNEL_SH" stop > /dev/null 2>&1 || true
  # Kill any lingering cftunnel tmux sessions from tests
  for session in $(tmux list-sessions -F '#{session_name}' 2>/dev/null || true); do
    if [[ "$session" == cftunnel-* ]]; then
      tmux kill-session -t "$session" 2>/dev/null || true
    fi
  done
  stop_http_servers
  rm -rf "$TEST_HOME"
  echo "Done."
}
trap cleanup EXIT

reset_state() {
  # Stop any running tunnels and HTTP servers from previous test
  bash "$TUNNEL_SH" stop > /dev/null 2>&1 || true
  # Kill any lingering cftunnel tmux sessions
  for session in $(tmux list-sessions -F '#{session_name}' 2>/dev/null || true); do
    if [[ "$session" == cftunnel-* ]]; then
      tmux kill-session -t "$session" 2>/dev/null || true
    fi
  done
  stop_http_servers
  rm -rf "${TEST_HOME}/.cloudflare-tunnels"
}

assert_contains() {
  local output="$1"
  local expected="$2"
  local label="${3:-}"
  if echo "$output" | grep -qF -- "$expected"; then
    return 0
  else
    echo "ASSERT FAILED [${label}]: expected output to contain '${expected}'"
    echo "  Got: ${output}"
    return 1
  fi
}

assert_not_contains() {
  local output="$1"
  local unexpected="$2"
  local label="${3:-}"
  if echo "$output" | grep -qF -- "$unexpected"; then
    echo "ASSERT FAILED [${label}]: expected output NOT to contain '${unexpected}'"
    echo "  Got: ${output}"
    return 1
  else
    return 0
  fi
}

assert_exit_code() {
  local actual="$1"
  local expected="$2"
  if [[ "$actual" == "$expected" ]]; then
    return 0
  else
    echo "ASSERT FAILED: expected exit code ${expected}, got ${actual}"
    return 1
  fi
}

assert_url_reachable() {
  local url="$1"
  local label="${2:-}"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" 2>/dev/null || echo "000")
  if [[ "$code" != "000" ]]; then
    return 0
  else
    echo "ASSERT FAILED [${label}]: URL ${url} not reachable"
    return 1
  fi
}

run_test() {
  local test_name="$1"
  local test_func="$2"
  TESTS_RUN=$((TESTS_RUN + 1))
  reset_state

  echo -n "  TEST: ${test_name}... "
  local output
  if output=$($test_func 2>&1); then
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "PASS"
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
    FAIL_MESSAGES+=("FAIL: ${test_name}\n  Output: ${output}")
    echo "FAIL"
    echo "    Output: ${output}"
  fi
}

# --- Tests ---

# ==================== CLI basics (no tunnel needed) ====================

test_help() {
  local out
  out=$(bash "$TUNNEL_SH" help)
  assert_contains "$out" "Usage: tunnel.sh" "help shows usage" &&
  assert_contains "$out" "start" "help shows start" &&
  assert_contains "$out" "stop" "help shows stop" &&
  assert_contains "$out" "list" "help shows list" &&
  assert_contains "$out" "gc" "help shows gc"
}

test_help_shows_ttl() {
  local out
  out=$(bash "$TUNNEL_SH" help)
  assert_contains "$out" "--ttl" "help shows --ttl"
}

test_unknown_command() {
  local out code=0
  out=$(bash "$TUNNEL_SH" foobar 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$out" "Unknown command: foobar" "unknown command"
}

test_no_args_shows_help() {
  local out
  out=$(bash "$TUNNEL_SH")
  assert_contains "$out" "Usage: tunnel.sh" "no args"
}

test_start_missing_port() {
  local out code=0
  out=$(bash "$TUNNEL_SH" start 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$out" "Usage:" "missing port"
}

test_start_unknown_option() {
  local out code=0
  out=$(bash "$TUNNEL_SH" start 8080 --bogus 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$out" "Unknown option: --bogus" "unknown option"
}

test_start_invalid_ttl() {
  local out code=0
  out=$(bash "$TUNNEL_SH" start 8080 --ttl "banana" 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$out" "Invalid TTL" "invalid ttl"
}

test_list_empty() {
  local out
  out=$(bash "$TUNNEL_SH" list)
  assert_contains "$out" "No active tunnels" "empty list"
}

test_status_not_found() {
  local out code=0
  out=$(bash "$TUNNEL_SH" status 1234 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$out" "No tunnel found on port 1234" "status not found"
}

test_status_missing_port() {
  local out code=0
  out=$(bash "$TUNNEL_SH" status 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$out" "Usage:" "missing port"
}

test_stop_not_found() {
  local out code=0
  out=$(bash "$TUNNEL_SH" stop 9999 2>&1) || code=$?
  assert_contains "$out" "No tunnel found on port 9999" "stop not found"
}

test_stop_all_empty() {
  local out
  out=$(bash "$TUNNEL_SH" stop)
  assert_contains "$out" "No active tunnels found" "stop all empty"
}

test_logs_not_found() {
  local out code=0
  out=$(bash "$TUNNEL_SH" logs 1234 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$out" "No logs found for port 1234" "logs not found"
}

test_logs_missing_port() {
  local out code=0
  out=$(bash "$TUNNEL_SH" logs 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$out" "Usage:" "missing port"
}

test_pid_dir_created_automatically() {
  rm -rf "${TEST_HOME}/.cloudflare-tunnels"
  local out
  out=$(bash "$TUNNEL_SH" list)
  assert_contains "$out" "No active tunnels" "auto-create dir" &&
  [[ -d "${TEST_HOME}/.cloudflare-tunnels" ]]
}

test_gc_runs_without_error() {
  local out code=0
  out=$(bash "$TUNNEL_SH" gc 2>&1) || code=$?
  assert_exit_code "$code" "0" &&
  assert_contains "$out" "Running garbage collection" "gc header"
}

test_cleanup_alias() {
  local out
  out=$(bash "$TUNNEL_SH" cleanup)
  assert_contains "$out" "Running garbage collection" "cleanup alias"
}

# ==================== Stale PID tests (no real tunnel needed) ====================

test_list_cleans_stale() {
  mkdir -p "${TEST_HOME}/.cloudflare-tunnels"
  echo "99999999" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-7777.pid"
  echo "https://stale.trycloudflare.com" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-7777.url"

  local out
  out=$(bash "$TUNNEL_SH" list)
  assert_contains "$out" "No active tunnels" "stale cleaned" &&
  [[ ! -f "${TEST_HOME}/.cloudflare-tunnels/tunnel-7777.pid" ]]
}

test_status_stale_pid() {
  mkdir -p "${TEST_HOME}/.cloudflare-tunnels"
  echo "99999999" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-2222.pid"

  local out
  out=$(bash "$TUNNEL_SH" status 2222)
  assert_contains "$out" "not running (stale entry)" "stale detected" &&
  assert_contains "$out" "Cleaning up" "stale cleaned" &&
  [[ ! -f "${TEST_HOME}/.cloudflare-tunnels/tunnel-2222.pid" ]]
}

test_stop_stale_pid() {
  mkdir -p "${TEST_HOME}/.cloudflare-tunnels"
  echo "99999999" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-3333.pid"

  local out
  out=$(bash "$TUNNEL_SH" stop 3333)
  assert_contains "$out" "was not running (stale PID" "stop stale" &&
  [[ ! -f "${TEST_HOME}/.cloudflare-tunnels/tunnel-3333.pid" ]]
}

test_stale_pid_on_start_gets_cleaned() {
  start_http_server "$PORT_A"
  mkdir -p "${TEST_HOME}/.cloudflare-tunnels"
  echo "99999999" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-${PORT_A}.pid"
  echo "https://old.trycloudflare.com" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-${PORT_A}.url"

  local out
  out=$(bash "$TUNNEL_SH" start "$PORT_A")
  assert_contains "$out" "trycloudflare.com" "started after stale" &&
  assert_not_contains "$out" "already running" "not duplicate"
}

test_gc_orphaned_tmux_session() {
  # Create an orphaned tmux session matching our prefix
  tmux new-session -d -s "cftunnel-55555" "sleep 300" 2>/dev/null || true
  sleep 0.3

  local out
  out=$(bash "$TUNNEL_SH" gc)
  assert_contains "$out" "Killing orphaned tmux session: cftunnel-55555" "gc kills orphan" &&
  ! tmux has-session -t "cftunnel-55555" 2>/dev/null
}

test_gc_orphaned_state_files() {
  mkdir -p "${TEST_HOME}/.cloudflare-tunnels"
  echo "99999999" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-6666.pid"
  echo "https://orphan.trycloudflare.com" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-6666.url"
  echo "forever" > "${TEST_HOME}/.cloudflare-tunnels/tunnel-6666.ttl"

  local out
  out=$(bash "$TUNNEL_SH" gc)
  assert_contains "$out" "Removing stale tunnel state for port 6666" "gc cleans state" &&
  [[ ! -f "${TEST_HOME}/.cloudflare-tunnels/tunnel-6666.pid" ]] &&
  [[ ! -f "${TEST_HOME}/.cloudflare-tunnels/tunnel-6666.url" ]] &&
  [[ ! -f "${TEST_HOME}/.cloudflare-tunnels/tunnel-6666.ttl" ]]
}

# ==================== Real tunnel tests ====================
# These are grouped into lifecycle tests to minimize tunnel creations
# and avoid hitting Cloudflare's aggressive rate limits on quick tunnels.
# Total tunnel creations: ~5 (down from ~15 with individual tests).

# Lifecycle 1: Start a single tunnel and exercise all read/query commands
# against it, then duplicate detection, then stop. (1 tunnel creation)
test_single_tunnel_lifecycle() {
  start_http_server "$PORT_A"

  # --- Start ---
  local start_out
  start_out=$(bash "$TUNNEL_SH" start "$PORT_A")
  assert_contains "$start_out" "Starting tunnel to http://localhost:${PORT_A}" "start msg" &&
  assert_contains "$start_out" "trycloudflare.com" "got URL" &&
  assert_contains "$start_out" "Port: ${PORT_A}" "port" &&
  assert_contains "$start_out" "Session: cftunnel-${PORT_A}" "session" &&
  assert_contains "$start_out" "TTL: 2h" "default ttl" || return 1

  # --- Reachable ---
  local url
  url=$(echo "$start_out" | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)
  [[ -n "$url" ]] || { echo "Could not extract URL"; return 1; }
  sleep 3
  assert_url_reachable "$url" "tunnel reachable" || return 1

  # --- Tmux session exists ---
  tmux has-session -t "cftunnel-${PORT_A}" 2>/dev/null || { echo "tmux session not found"; return 1; }

  # --- List ---
  local list_out
  list_out=$(bash "$TUNNEL_SH" list)
  assert_contains "$list_out" "Port ${PORT_A}" "list port" &&
  assert_contains "$list_out" "trycloudflare.com" "list URL" &&
  assert_contains "$list_out" "Session cftunnel-${PORT_A}" "list session" &&
  assert_contains "$list_out" "TTL" "list TTL" || return 1

  # --- Status ---
  local status_out
  status_out=$(bash "$TUNNEL_SH" status "$PORT_A")
  assert_contains "$status_out" "Tunnel on port ${PORT_A} is running" "status running" &&
  assert_contains "$status_out" "PID:" "PID" &&
  assert_contains "$status_out" "URL:" "URL" &&
  assert_contains "$status_out" "Session:" "Session" &&
  assert_contains "$status_out" "TTL:" "TTL" || return 1

  # --- Logs ---
  local logs_out
  logs_out=$(bash "$TUNNEL_SH" logs "$PORT_A")
  assert_contains "$logs_out" "trycloudflare.com" "logs have URL" || return 1

  # --- Duplicate detection ---
  local dup_out
  dup_out=$(bash "$TUNNEL_SH" start "$PORT_A")
  assert_contains "$dup_out" "Tunnel already running on port ${PORT_A}" "duplicate warning" &&
  assert_contains "$dup_out" "URL:" "shows URL" &&
  assert_contains "$dup_out" "Session:" "shows session" || return 1

  # --- Stop ---
  local stop_out
  stop_out=$(bash "$TUNNEL_SH" stop "$PORT_A")
  assert_contains "$stop_out" "Stopped tunnel on port ${PORT_A}" "stopped" &&
  [[ ! -f "${TEST_HOME}/.cloudflare-tunnels/tunnel-${PORT_A}.pid" ]] &&
  ! tmux has-session -t "cftunnel-${PORT_A}" 2>/dev/null || return 1
}

# Lifecycle 2: Multi-tunnel with TTL options and concurrent limit enforcement.
# (2 tunnel creations + 1 rejected)
test_multi_tunnel_and_limits() {
  start_http_server "$PORT_A"
  start_http_server "$PORT_B"
  start_http_server "$PORT_C"

  # Start two tunnels with different TTLs
  local out1
  out1=$(bash "$TUNNEL_SH" start "$PORT_A" --ttl 1h)
  assert_contains "$out1" "TTL: 1h" "explicit ttl" &&
  assert_contains "$out1" "trycloudflare.com" "got URL A" || return 1

  local out2
  out2=$(bash "$TUNNEL_SH" start "$PORT_B" --ttl forever)
  assert_contains "$out2" "TTL: forever" "forever ttl" &&
  assert_contains "$out2" "trycloudflare.com" "got URL B" || return 1

  # List should show both
  local list_out
  list_out=$(bash "$TUNNEL_SH" list)
  assert_contains "$list_out" "Port ${PORT_A}" "list A" &&
  assert_contains "$list_out" "Port ${PORT_B}" "list B" || return 1

  # Third tunnel should hit concurrent limit (TUNNEL_MAX_CONCURRENT=2)
  local limit_out code=0
  limit_out=$(bash "$TUNNEL_SH" start "$PORT_C" 2>&1) || code=$?
  assert_exit_code "$code" "1" &&
  assert_contains "$limit_out" "Maximum of 2 concurrent tunnels reached" "limit msg" &&
  assert_contains "$limit_out" "Stop a tunnel first" "stop hint" || return 1

  # Stop all
  local stop_out
  stop_out=$(bash "$TUNNEL_SH" stop)
  assert_contains "$stop_out" "Stopped tunnel on port ${PORT_A}" "stop A" &&
  assert_contains "$stop_out" "Stopped tunnel on port ${PORT_B}" "stop B" &&
  ! tmux has-session -t "cftunnel-${PORT_A}" 2>/dev/null &&
  ! tmux has-session -t "cftunnel-${PORT_B}" 2>/dev/null || return 1
}

# Lifecycle 3: Stop and restart to verify clean restart and URL change.
# (2 tunnel creations)
test_restart_and_url_change() {
  start_http_server "$PORT_A"

  # Start and grab URL
  local out1
  out1=$(bash "$TUNNEL_SH" start "$PORT_A")
  local url1
  url1=$(echo "$out1" | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)
  [[ -n "$url1" ]] || { echo "Could not extract URL1"; return 1; }

  # Stop
  bash "$TUNNEL_SH" stop "$PORT_A" > /dev/null 2>&1
  sleep 1

  # Restart — should succeed with no "already running" warning
  local out2
  out2=$(bash "$TUNNEL_SH" start "$PORT_A")
  assert_contains "$out2" "trycloudflare.com" "restarted" &&
  assert_not_contains "$out2" "already running" "no dup warning" || return 1

  local url2
  url2=$(echo "$out2" | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)
  [[ -n "$url2" ]] || { echo "Could not extract URL2"; return 1; }

  # URLs should be different (random each time — not a hard failure)
  if [[ "$url1" != "$url2" ]]; then
    return 0
  else
    echo "URLs were the same: ${url1} — might happen rarely but unexpected"
    return 0
  fi
}

# --- Run all tests ---

echo ""
echo "========================================="
echo "  tunnel.sh test suite (REAL tunnels)"
echo "========================================="
echo ""
echo "  Using ports: ${PORT_A}, ${PORT_B}, ${PORT_C}"
echo "  Concurrent limit: ${TUNNEL_MAX_CONCURRENT}"
echo ""

echo "--- CLI basics (fast) ---"
run_test "help command"                        test_help
run_test "help shows --ttl"                    test_help_shows_ttl
run_test "unknown command"                     test_unknown_command
run_test "no args shows help"                  test_no_args_shows_help
run_test "start missing port"                  test_start_missing_port
run_test "start unknown option"                test_start_unknown_option
run_test "start invalid TTL"                   test_start_invalid_ttl
run_test "list empty"                          test_list_empty
run_test "status not found"                    test_status_not_found
run_test "status missing port"                 test_status_missing_port
run_test "stop not found"                      test_stop_not_found
run_test "stop all (none running)"             test_stop_all_empty
run_test "logs not found"                      test_logs_not_found
run_test "logs missing port"                   test_logs_missing_port
run_test "PID dir auto-created"                test_pid_dir_created_automatically
run_test "gc runs without error"                test_gc_runs_without_error
run_test "cleanup alias works"                 test_cleanup_alias

echo ""
echo "--- Stale PID / orphan handling ---"
run_test "list cleans stale PIDs"              test_list_cleans_stale
run_test "status stale PID"                    test_status_stale_pid
run_test "stop stale PID"                      test_stop_stale_pid
run_test "stale PID cleaned on start"          test_stale_pid_on_start_gets_cleaned
run_test "gc orphaned tmux session"            test_gc_orphaned_tmux_session
run_test "gc orphaned state files"             test_gc_orphaned_state_files

echo ""
echo "--- Real tunnel operations (slower, grouped to avoid rate limits) ---"
run_test "single tunnel lifecycle"             test_single_tunnel_lifecycle
run_test "multi-tunnel + TTL + limits"         test_multi_tunnel_and_limits
run_test "restart and URL change"              test_restart_and_url_change

echo ""
echo "========================================="
echo "  Results: ${TESTS_PASSED}/${TESTS_RUN} passed, ${TESTS_FAILED} failed"
echo "========================================="

if [[ ${#FAIL_MESSAGES[@]} -gt 0 ]]; then
  echo ""
  echo "Failures:"
  for msg in "${FAIL_MESSAGES[@]}"; do
    echo -e "  $msg"
  done
fi

echo ""
exit "$TESTS_FAILED"
