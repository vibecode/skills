---

## name: x-api
description: "The X (Twitter) API v2 — Bearer Token (App-Only) endpoints only. Use when working with the X API, Twitter API, or when the user needs to search tweets, look up tweets/users, access timelines, filtered streams, spaces, lists, trends, or any read-only X API operation. This skill covers all endpoints that use OAuth 2.0 App-Only (Bearer Token) authentication. Triggers: X API, Twitter API, tweet search, tweet lookup, user lookup, filtered stream, sampled stream, spaces, lists, trends, compliance jobs."

# X API v2 — Bearer Token (App-Only)

Bearer Token auth provides **read-only access to public data** without user context. It cannot post tweets, like, retweet, bookmark, send DMs, or perform any write action.

## Authentication

```
Authorization: Bearer <BEARER_TOKEN>
```

Store the token in env var `X_BEARER_TOKEN`. Never hardcode it. Base URL: `https://api.x.com/2`

## Rate Limits

All limits are **per 15-minute window** unless noted. Bearer Token has its own pool separate from user tokens. When rate-limited: `429` response with `x-rate-limit-reset` header (Unix timestamp).

## Endpoint Categories

For full endpoint details, parameters, and rate limits, see [references/endpoints.md](references/endpoints.md).

### Tweets

- **Lookup**: GET `/2/tweets`, GET `/2/tweets/:id`
- **Search recent**: GET `/2/tweets/search/recent` — last 7 days
- **Search all**: GET `/2/tweets/search/all` — full archive (Pro/Enterprise)
- **Counts**: GET `/2/tweets/counts/recent`, `/2/tweets/counts/all` — Bearer-only
- **Timelines**: GET `/2/users/:id/tweets`, `/2/users/:id/mentions`
- **Retweets/Quotes**: GET `/2/tweets/:id/retweeted_by`, `/2/tweets/:id/quote_tweets`
- **Likes**: GET `/2/tweets/:id/liking_users`, `/2/users/:id/liked_tweets`

### Streams (Bearer-only)

- **Filtered stream**: GET `/2/tweets/search/stream` — real-time filtered tweets
- **Stream rules**: GET/POST `/2/tweets/search/stream/rules` — manage filter rules
- **Sampled stream**: GET `/2/tweets/sample/stream` — ~1% random sample
- **Sample10**: GET `/2/tweets/sample10/stream` — ~10% sample (Enterprise)

### Users

- **Lookup**: GET `/2/users`, `/2/users/:id`, `/2/users/by`, `/2/users/by/username/:username`
- **Search**: GET `/2/users/search`
- **Follows**: GET `/2/users/:id/following`, `/2/users/:id/followers`

### Spaces

- **Lookup**: GET `/2/spaces/:id`, `/2/spaces`, `/2/spaces/by/creator_ids`
- **Search**: GET `/2/spaces/search`
- **Tweets**: GET `/2/spaces/:id/tweets`

### Lists

- **Lookup**: GET `/2/lists/:id`, `/2/users/:id/owned_lists`
- **Tweets**: GET `/2/lists/:id/tweets`
- **Members**: GET `/2/lists/:id/members`, `/2/users/:id/list_memberships`
- **Followers**: GET `/2/lists/:id/followers`, `/2/users/:id/followed_lists`

### Other

- **Trends**: GET `/2/trends/by/woeid/:id` (Bearer-only)
- **Communities**: GET `/2/communities/:id`, `/2/communities/search`
- **Compliance**: POST/GET `/2/compliance/jobs` (Bearer-only)
- **Usage**: GET `/2/usage/tweets` (Bearer-only)

## Query Syntax (Search & Stream Rules)


| Operator                     | Example               | Description              |
| ---------------------------- | --------------------- | ------------------------ |
| keyword                      | `climate change`      | Match words              |
| `"exact"`                    | `"climate change"`    | Exact phrase             |
| `from:`                      | `from:elonmusk`       | By author                |
| `to:`                        | `to:NASA`             | Replies to user          |
| `#`                          | `#AI`                 | Hashtag                  |
| `@`                          | `@openai`             | Mention                  |
| `has:media`                  |                       | Has media attached       |
| `has:links`                  |                       | Has URLs                 |
| `has:images` / `has:videos`  |                       | Media type filter        |
| `is:retweet` / `-is:retweet` |                       | Retweet filter           |
| `is:reply` / `is:quote`      |                       | Reply/quote filter       |
| `lang:`                      | `lang:en`             | Language filter          |
| `conversation_id:`           | `conversation_id:123` | Thread filter            |
| `place_country:`             | `place_country:US`    | Geo filter               |
| `context:` / `entity:`       |                       | Annotation/entity filter |


Combine with AND (space), OR, NOT (-), and grouping `()`.

## Expansions & Fields

Append these query parameters to enrich responses:

- `tweet.fields`: `author_id,created_at,public_metrics,entities,conversation_id,lang,referenced_tweets,context_annotations,note_tweet`
- `user.fields`: `created_at,description,public_metrics,profile_image_url,username,verified,verified_type,location`
- `media.fields`: `url,preview_image_url,type,alt_text,duration_ms,height,width,public_metrics,variants`
- `place.fields`: `full_name,country,country_code,geo,place_type`
- `poll.fields`: `options,end_datetime,voting_status,duration_minutes`
- `expansions`: `author_id,referenced_tweets.id,attachments.media_keys,attachments.poll_ids,geo.place_id,in_reply_to_user_id`

**Note**: `non_public_metrics`, `organic_metrics`, `promoted_metrics` require user-context auth — they error with Bearer Token.

## Pagination

Paginated endpoints return `next_token` in `meta`. Pass it as `pagination_token` (or `next_token` for search). Loop until no token returned.

## xcli — CLI Tool

A zero-dependency TypeScript CLI covering all Bearer Token endpoints. Located at `scripts/xcli/`.

**Always use xcli for X API calls. Do not use cURL.**

**Requires:** [Bun](https://bun.sh) runtime.

### Usage

From the `skills/x-api/` directory:

```
bun xcli <resource> <action> [args] [--flags]
```

Requires `X_BEARER_TOKEN` environment variable (auto-loaded from `.env` by Bun).

### Commands


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


### Common flags

```
--tweet-fields    Comma-separated tweet.fields
--user-fields     Comma-separated user.fields
--media-fields    Comma-separated media.fields
--expansions      Comma-separated expansions
--max-results     Maximum results per page
--page-token      Pagination token (mapped to pagination_token or next_token)
--start-time      ISO 8601 start time
--end-time        ISO 8601 end time
--since-id        Tweet ID lower bound
--until-id        Tweet ID upper bound
--granularity     minute, hour, or day (for counts)
--sort-order      recency or relevancy (for search)
```

### Examples

```bash
# Search recent tweets
bun xcli tweets search "from:NASA -is:retweet" --max-results 50 --tweet-fields created_at,public_metrics

# Search with expansions
bun xcli tweets search "from:elonmusk" --max-results 10 --tweet-fields created_at,public_metrics --expansions author_id --user-fields username

# Paginate search results (use next_token from previous response's meta)
bun xcli tweets search "#AI lang:en" --max-results 100 --page-token NEXT_TOKEN_HERE

# Tweet lookup (single)
bun xcli tweets lookup 123456789 --tweet-fields created_at,public_metrics,author_id

# Tweet lookup (multiple — comma-separated IDs auto-detected)
bun xcli tweets lookup 111,222,333

# Tweet counts by day
bun xcli tweets counts "from:NASA" --granularity day

# User timeline
bun xcli tweets timeline USER_ID --max-results 10 --tweet-fields created_at,public_metrics

# User lookup by username
bun xcli users by-username elonmusk --user-fields public_metrics,verified_type,description

# Multi-user lookup (comma-separated auto-detected)
bun xcli users by-username elonmusk,NASA,openai --user-fields public_metrics

# User lookup by ID
bun xcli users lookup 44196397

# Followers / following
bun xcli users followers USER_ID --max-results 100
bun xcli users following USER_ID --max-results 100

# Filtered stream rules
bun xcli streams rules-list
bun xcli streams rules-add "#AI lang:en" --tag ai-english
bun xcli streams rules-delete RULE_ID_1,RULE_ID_2

# Connect to filtered stream (real-time, streams to stdout)
bun xcli streams connect --tweet-fields created_at --expansions author_id

# Sampled stream
bun xcli streams sample --tweet-fields created_at,author_id

# Trends (US WOEID = 23424977)
bun xcli trends 23424977

# Spaces search
bun xcli spaces search "music"

# Lists
bun xcli lists owned USER_ID
bun xcli lists tweets LIST_ID --max-results 50

# Compliance
bun xcli compliance create --type tweets
bun xcli compliance list --type tweets
bun xcli compliance get JOB_ID

# Usage stats
bun xcli usage

# Pipe to jq
bun xcli users by-username NASA | jq .data.public_metrics
bun xcli tweets search "hello" --max-results 10 | jq '.data[].text'
```

## Not Supported with Bearer Token

These require user-context (OAuth 1.0a or OAuth 2.0 PKCE):

- POST/DELETE tweets, retweets, likes, bookmarks
- Home timeline (`/2/users/:id/timelines/reverse_chronological`)
- `GET /2/users/me`
- Follow/unfollow, block/unblock, mute/unmute
- Manage lists (create/update/delete, add/remove members)
- Direct messages, hide replies

We may implement these features in a future version of x-cli but for now we are not going to do that.