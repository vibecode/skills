---
name: x-api
description: "The X (Twitter) API v2 — Bearer Token (App-Only) endpoints only. Use when working with the X API, Twitter API, or when the user needs to search tweets, look up tweets/users, access timelines, filtered streams, spaces, lists, trends, or any read-only X API operation. This skill covers all endpoints that use OAuth 2.0 App-Only (Bearer Token) authentication. Triggers: X API, Twitter API, tweet search, tweet lookup, user lookup, filtered stream, sampled stream, spaces, lists, trends, compliance jobs."
---

# X API v2 — Bearer Token (App-Only)

Bearer Token auth = **read-only access to public data**. Cannot post, like, retweet, bookmark, or DM.

## Prerequisites

- [Bun](https://bun.sh) runtime
- `X_BEARER_TOKEN` in `.env` (auto-loaded by Bun)

### Getting a Bearer Token

If the user doesn't have a Bearer Token yet:

1. Go to https://console.x.com/ and log in with their X account
2. Click **"Apps"** in the sidebar
3. Click **"Create App"**
4. Copy only the **Bearer Token**
5. Add it to `.env` in the `skills/x-api/` directory:
   ```
   X_BEARER_TOKEN=AAAA...your-token-here
   ```

## Quick Start

```bash
bun xcli tweets search "from:vibecodeapp" --max-results 10
bun xcli users by-username vibecodeapp --fields full --pretty
bun xcli trends 23424977
bun xcli tweets --help
```

**Always use xcli for X API calls. Do not use cURL.**

Run from the `skills/x-api/` directory: `bun xcli <resource> <action> [args] [--flags]`

## Output Format

- **Default**: compact JSON (single line) — ideal for piping to `jq`
- **`--pretty`**: indented JSON for readability
- **Errors**: always go to stderr

```bash
bun xcli usage                    # compact JSON
bun xcli usage --pretty           # indented JSON
bun xcli users by-username NASA | jq .data.public_metrics   # pipe to jq
```

## Choosing the Right Command

| Intent | Command |
|--------|---------|
| Find tweets about a topic | `tweets search "<query>"` |
| What did @user tweet? | First `users by-username <handle>` to get ID, then `tweets timeline <user-id>` |
| Look up specific tweets | `tweets lookup <id>` or `tweets lookup <id1,id2,id3>` |
| How many tweets match? | `tweets counts "<query>"` |
| Who retweeted/liked a tweet? | `tweets retweeted-by <id>` or `tweets liking-users <id>` |
| Get user profile info | `users by-username <handle> --fields full` |
| Get followers/following | `users followers <user-id>` or `users following <user-id>` |
| Monitor real-time tweets | `streams rules-add "<rule>"` then `streams connect` |
| What's trending? | `trends <woeid>` (US = 23424977) |
| Find spaces about a topic | `spaces search "<query>"` |
| Get list tweets | `lists tweets <list-id>` |

## Commands

| Resource      | Actions                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tweets`      | `lookup`, `search`, `search-all`, `counts`, `counts-all`, `timeline`, `mentions`, `retweeted-by`, `retweets`, `quote-tweets`, `liking-users`, `liked-tweets` |
| `streams`     | `connect`, `sample`, `sample10`, `rules-list`, `rules-add`, `rules-delete`                                                                                   |
| `users`       | `lookup`, `by-username`, `search`, `followers`, `following`                                                                                                  |
| `spaces`      | `lookup`, `by-creator`, `search`, `tweets`                                                                                                                   |
| `lists`       | `lookup`, `owned`, `tweets`, `members`, `memberships`, `followers`, `followed`                                                                               |
| `trends`      | `<woeid>`                                                                                                                                                    |
| `communities` | `lookup`, `search`                                                                                                                                           |
| `compliance`  | `create`, `get`, `list`                                                                                                                                      |
| `usage`       | *(no action needed)*                                                                                                                                         |

## Common Flags

```
--fields        Field preset (e.g. "full") — auto-expands fields/expansions for the resource
--pretty        Pretty-print JSON output (default: compact)
--help          Show help (global or per-resource)
--tweet-fields  Comma-separated tweet.fields
--user-fields   Comma-separated user.fields
--media-fields  Comma-separated media.fields
--expansions    Comma-separated expansions
--max-results   Maximum results per page
--page-token    Pagination token (mapped to pagination_token or next_token)
--start-time    ISO 8601 start time
--end-time      ISO 8601 end time
--since-id      Tweet ID lower bound
--until-id      Tweet ID upper bound
--granularity   minute, hour, or day (for counts)
--sort-order    recency or relevancy (for search)
```

## Examples

```bash
# Search recent tweets with full field expansion
bun xcli tweets search "from:NASA -is:retweet" --max-results 50 --fields full
bun xcli tweets search "from:NASA -is:retweet" --max-results 50 --fields full --pretty

# Search with manual field selection
bun xcli tweets search "from:elonmusk" --max-results 10 --tweet-fields created_at,public_metrics --expansions author_id --user-fields username

# Paginate search results (use next_token from previous response's meta)
bun xcli tweets search "#AI lang:en" --max-results 100 --page-token NEXT_TOKEN_HERE

# Tweet lookup
bun xcli tweets lookup 123456789
bun xcli tweets lookup 111,222,333

# Tweet counts by day
bun xcli tweets counts "from:NASA" --granularity day

# User timeline
bun xcli tweets timeline USER_ID --max-results 10

# User lookup
bun xcli users by-username elonmusk --fields full --pretty
bun xcli users by-username elonmusk,NASA,openai --user-fields public_metrics
bun xcli users lookup 44196397

# Followers / following
bun xcli users followers USER_ID --max-results 100
bun xcli users following USER_ID --max-results 100

# Filtered stream
bun xcli streams rules-list
bun xcli streams rules-add "#AI lang:en" --tag ai-english
bun xcli streams rules-delete RULE_ID_1,RULE_ID_2
bun xcli streams connect --tweet-fields created_at --expansions author_id

# Trends (US WOEID = 23424977)
bun xcli trends 23424977

# Spaces, Lists, Compliance, Usage
bun xcli spaces search "music"
bun xcli lists owned USER_ID
bun xcli lists tweets LIST_ID --max-results 50
bun xcli compliance create --type tweets
bun xcli compliance list --type tweets
bun xcli usage
```

## API Reference

- [references/API.md](references/API.md) — endpoint categories, query syntax, expansions & fields, pagination
- [references/endpoints.md](references/endpoints.md) — full endpoint parameters and rate limits

## Not Supported with Bearer Token

These require user-context (OAuth 1.0a or OAuth 2.0 PKCE):

- POST/DELETE tweets, retweets, likes, bookmarks
- Home timeline (`/2/users/:id/timelines/reverse_chronological`)
- `GET /2/users/me`
- Follow/unfollow, block/unblock, mute/unmute
- Manage lists (create/update/delete, add/remove members)
- Direct messages, hide replies

We may implement these features in a future version of x-cli but for now we are not going to do that.
