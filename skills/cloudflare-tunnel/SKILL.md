---
name: cloudflare-tunnel
description: >
  Manage Cloudflare Quick Tunnels (TryCloudflare) to expose local services to the internet.
  Use when the user wants to: start a tunnel, expose a local port publicly, create a public URL
  for localhost, stop a tunnel, list active tunnels, check tunnel status, or anything involving
  cloudflared quick tunnels. Triggers: "tunnel", "expose port", "public URL", "cloudflare tunnel",
  "trycloudflare", "share localhost".
---

# Cloudflare Quick Tunnel Management

Manage quick tunnels via `scripts/tunnel.sh`. Quick tunnels require no Cloudflare account — they assign a random `*.trycloudflare.com` URL.

Each tunnel runs inside a named **tmux session** (`cftunnel-<port>`) for process isolation and easy inspection.

**Prerequisites:**
- `cloudflared` must be installed. If not found:
  - macOS: `curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz | tar xz -C /usr/local/bin`
  - Linux: `curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared`
- `tmux` must be installed.

## Commands

Run all commands via: `bash <skill-dir>/scripts/tunnel.sh <command> [args]`

| Command | Usage | Description |
|---------|-------|-------------|
| `start` | `start <port> [--protocol http\|https] [--ttl 2h\|30m\|forever]` | Start a tunnel to localhost on the given port. Defaults to `http` protocol and `2h` TTL. |
| `stop` | `stop [port]` | Stop a specific tunnel, or all tunnels if no port given. Kills process, tmux session, and state files. |
| `list` | `list` | List all active tunnels with port, PID, session, TTL, and URL. |
| `status` | `status <port>` | Check if a tunnel on a specific port is running. |
| `logs` | `logs <port>` | Show cloudflared logs for a tunnel. |
| `gc` | `gc` (or `cleanup`) | Find and kill orphaned cloudflared processes, tmux sessions, and stale state files. |

## Workflow

1. User asks to expose a port -> run `start <port>` (optionally with `--ttl`)
2. Report back the `*.trycloudflare.com` URL
3. User asks to stop -> run `stop <port>` or `stop` for all
4. User asks what's running -> run `list`
5. Periodically or on issues -> run `gc` to clean up orphans

## TTL (Time-to-Live)

Tunnels auto-shut down after their TTL expires. Accepted formats:

| Format | Example | Meaning |
|--------|---------|---------|
| Hours | `2h` | 2 hours (default) |
| Minutes | `30m` | 30 minutes |
| Seconds | `90s` | 90 seconds |
| Forever | `forever` | No auto-shutdown |

## Notes

- Tunnels run inside tmux sessions named `cftunnel-<port>` — attach with `tmux attach -t cftunnel-<port>` for live inspection
- Maximum of 5 concurrent tunnels (configurable via `TUNNEL_MAX_CONCURRENT` env var). If the limit is hit, the user is shown active tunnels and asked to stop one first
- Each port can only have one tunnel at a time
- Before starting a new tunnel, stale/orphaned entries are automatically cleaned up
- PID, URL, TTL, and log state stored in `~/.cloudflare-tunnels/`
- The tunnel URL is random and changes each time a tunnel is restarted
- Quick tunnels have no SLA — for production use, suggest named tunnels with a Cloudflare account
