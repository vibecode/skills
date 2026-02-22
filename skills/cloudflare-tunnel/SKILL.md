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

**Prerequisite:** `cloudflared` must be installed. If not found, install the binary directly:
- macOS: `curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz | tar xz -C /usr/local/bin`
- Linux: `curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared`

## Commands

Run all commands via: `bash <skill-dir>/scripts/tunnel.sh <command> [args]`

| Command | Usage | Description |
|---------|-------|-------------|
| `start` | `start <port> [--protocol http\|https]` | Start a tunnel to localhost on the given port. Defaults to `http`. |
| `stop` | `stop [port]` | Stop a specific tunnel, or all tunnels if no port given. |
| `list` | `list` | List all active tunnels with port, PID, and URL. |
| `status` | `status <port>` | Check if a tunnel on a specific port is running. |
| `logs` | `logs <port>` | Show cloudflared logs for a tunnel. |

## Workflow

1. User asks to expose a port -> run `start <port>`
2. Report back the `*.trycloudflare.com` URL
3. User asks to stop -> run `stop <port>` or `stop` for all
4. User asks what's running -> run `list`

## Notes

- Tunnels run in the background and persist until stopped or the machine reboots
- Each port can only have one tunnel at a time
- PID and URL state stored in `~/.cloudflare-tunnels/`
- The tunnel URL is random and changes each time a tunnel is restarted
- Quick tunnels have no SLA — for production use, suggest named tunnels with a Cloudflare account
