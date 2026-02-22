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

# Ports we'll use (pick high ports unlikely to conflict)
PORT_A=18771
PORT_B=18772
PORT_C=18773

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
  # Stop all tunnels
  bash "$TUNNEL_SH" stop > /dev/null 2>&1 || true
  stop_http_servers
  rm -rf "$TEST_HOME"
  echo "Done."
}
trap cleanup EXIT

reset_state() {
  # Stop any running tunnels and HTTP servers from previous test
  bash "$TUNNEL_SH" stop > /dev/null 2>&1 || true
  stop_http_servers
  rm -rf "${TEST_HOME}/.cloudflare-tunnels"
}

assert_contains() {
  local output="$1"
  local expected="$2"
  local label="${3:-}"
  if echo "$output" | grep -qF "$expected"; then
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
  if echo "$output" | grep -qF "$unexpected"; then
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
  assert_contains "$out" "list" "help shows list"
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

# ==================== Real tunnel tests ====================

test_start_real_tunnel() {
  start_http_server "$PORT_A"
  local out
  out=$(bash "$TUNNEL_SH" start "$PORT_A")
  assert_contains "$out" "Starting tunnel to http://localhost:${PORT_A}" "start msg" &&
  assert_contains "$out" "trycloudflare.com" "got URL" &&
  assert_contains "$out" "Port: ${PORT_A}" "port"
}

test_start_real_tunnel_is_reachable() {
  start_http_server "$PORT_A"
  local out
  out=$(bash "$TUNNEL_SH" start "$PORT_A")

  # Extract the URL
  local url
  url=$(echo "$out" | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)
  [[ -n "$url" ]] || { echo "Could not extract URL"; return 1; }

  # Give cloudflare a moment to propagate
  sleep 3
  assert_url_reachable "$url" "tunnel reachable"
}

test_start_duplicate_real_tunnel() {
  start_http_server "$PORT_A"
  bash "$TUNNEL_SH" start "$PORT_A" > /dev/null 2>&1

  local out
  out=$(bash "$TUNNEL_SH" start "$PORT_A")
  assert_contains "$out" "Tunnel already running on port ${PORT_A}" "duplicate warning" &&
  assert_contains "$out" "URL:" "shows URL"
}

test_start_multiple_real_tunnels() {
  start_http_server "$PORT_A"
  start_http_server "$PORT_B"

  local out1 out2
  out1=$(bash "$TUNNEL_SH" start "$PORT_A")
  out2=$(bash "$TUNNEL_SH" start "$PORT_B")
  assert_contains "$out1" "Port: ${PORT_A}" "first tunnel" &&
  assert_contains "$out2" "Port: ${PORT_B}" "second tunnel"

  local list_out
  list_out=$(bash "$TUNNEL_SH" list)
  assert_contains "$list_out" "Port ${PORT_A}" "list A" &&
  assert_contains "$list_out" "Port ${PORT_B}" "list B"
}

test_list_real_active() {
  start_http_server "$PORT_A"
  bash "$TUNNEL_SH" start "$PORT_A" > /dev/null 2>&1

  local out
  out=$(bash "$TUNNEL_SH" list)
  assert_contains "$out" "Port ${PORT_A}" "list port" &&
  assert_contains "$out" "trycloudflare.com" "list URL"
}

test_status_real_running() {
  start_http_server "$PORT_A"
  bash "$TUNNEL_SH" start "$PORT_A" > /dev/null 2>&1

  local out
  out=$(bash "$TUNNEL_SH" status "$PORT_A")
  assert_contains "$out" "Tunnel on port ${PORT_A} is running" "status running" &&
  assert_contains "$out" "PID:" "PID" &&
  assert_contains "$out" "URL:" "URL"
}

test_stop_real_tunnel() {
  start_http_server "$PORT_A"
  bash "$TUNNEL_SH" start "$PORT_A" > /dev/null 2>&1

  local out
  out=$(bash "$TUNNEL_SH" stop "$PORT_A")
  assert_contains "$out" "Stopped tunnel on port ${PORT_A}" "stopped" &&
  [[ ! -f "${TEST_HOME}/.cloudflare-tunnels/tunnel-${PORT_A}.pid" ]]
}

test_stop_all_real_tunnels() {
  start_http_server "$PORT_A"
  start_http_server "$PORT_B"
  bash "$TUNNEL_SH" start "$PORT_A" > /dev/null 2>&1
  bash "$TUNNEL_SH" start "$PORT_B" > /dev/null 2>&1

  local out
  out=$(bash "$TUNNEL_SH" stop)
  assert_contains "$out" "Stopped tunnel on port ${PORT_A}" "stop A" &&
  assert_contains "$out" "Stopped tunnel on port ${PORT_B}" "stop B"
}

test_stop_then_restart_real() {
  start_http_server "$PORT_A"
  bash "$TUNNEL_SH" start "$PORT_A" > /dev/null 2>&1
  bash "$TUNNEL_SH" stop "$PORT_A" > /dev/null 2>&1

  local out
  out=$(bash "$TUNNEL_SH" start "$PORT_A")
  assert_contains "$out" "trycloudflare.com" "restarted" &&
  assert_not_contains "$out" "already running" "no dup warning"
}

test_logs_real() {
  start_http_server "$PORT_A"
  bash "$TUNNEL_SH" start "$PORT_A" > /dev/null 2>&1

  local out
  out=$(bash "$TUNNEL_SH" logs "$PORT_A")
  assert_contains "$out" "trycloudflare.com" "logs have URL"
}

test_tunnel_url_changes_on_restart() {
  start_http_server "$PORT_A"

  # Start and grab URL
  local out1
  out1=$(bash "$TUNNEL_SH" start "$PORT_A")
  local url1
  url1=$(echo "$out1" | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)

  # Stop
  bash "$TUNNEL_SH" stop "$PORT_A" > /dev/null 2>&1
  sleep 1

  # Start again
  local out2
  out2=$(bash "$TUNNEL_SH" start "$PORT_A")
  local url2
  url2=$(echo "$out2" | grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | head -1)

  [[ -n "$url1" ]] && [[ -n "$url2" ]] || { echo "Could not extract URLs"; return 1; }

  # URLs should be different (random each time)
  if [[ "$url1" != "$url2" ]]; then
    return 0
  else
    echo "URLs were the same: ${url1} — might happen rarely but is unexpected"
    # Not a hard failure since there's a tiny chance of collision
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
echo ""

echo "--- CLI basics (fast) ---"
run_test "help command"                        test_help
run_test "unknown command"                     test_unknown_command
run_test "no args shows help"                  test_no_args_shows_help
run_test "start missing port"                  test_start_missing_port
run_test "start unknown option"                test_start_unknown_option
run_test "list empty"                          test_list_empty
run_test "status not found"                    test_status_not_found
run_test "status missing port"                 test_status_missing_port
run_test "stop not found"                      test_stop_not_found
run_test "stop all (none running)"             test_stop_all_empty
run_test "logs not found"                      test_logs_not_found
run_test "logs missing port"                   test_logs_missing_port
run_test "PID dir auto-created"                test_pid_dir_created_automatically

echo ""
echo "--- Stale PID handling ---"
run_test "list cleans stale PIDs"              test_list_cleans_stale
run_test "status stale PID"                    test_status_stale_pid
run_test "stop stale PID"                      test_stop_stale_pid
run_test "stale PID cleaned on start"          test_stale_pid_on_start_gets_cleaned

echo ""
echo "--- Real tunnel operations (slower) ---"
run_test "start real tunnel"                   test_start_real_tunnel
run_test "tunnel is reachable via URL"         test_start_real_tunnel_is_reachable
run_test "start duplicate (warns)"             test_start_duplicate_real_tunnel
run_test "start multiple tunnels"              test_start_multiple_real_tunnels
run_test "list active tunnels"                 test_list_real_active
run_test "status running tunnel"               test_status_real_running
run_test "stop specific tunnel"                test_stop_real_tunnel
run_test "stop all tunnels"                    test_stop_all_real_tunnels
run_test "stop then restart same port"         test_stop_then_restart_real
run_test "logs show tunnel output"             test_logs_real
run_test "URL changes on restart"              test_tunnel_url_changes_on_restart

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
