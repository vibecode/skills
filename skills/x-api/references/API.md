# X API v2 Reference

Detailed API reference for X API v2 Bearer Token (App-Only) endpoints.

For full endpoint parameters and rate limits, see [endpoints.md](endpoints.md).

## Endpoint Categories

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
| `lang:`                      | `lang:en`             | Language filter           |
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
