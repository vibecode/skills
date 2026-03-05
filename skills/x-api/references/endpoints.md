# X API v2 — Bearer Token Endpoint Reference

Complete reference for all endpoints supporting OAuth 2.0 App-Only (Bearer Token) authentication.

## Table of Contents

- [Tweets Lookup](#tweets-lookup)
- [Search Tweets](#search-tweets)
- [Tweet Counts](#tweet-counts)
- [Timelines](#timelines)
- [Filtered Stream](#filtered-stream)
- [Sampled Streams](#sampled-streams)
- [Retweets & Quote Tweets](#retweets--quote-tweets)
- [Likes Lookup](#likes-lookup)
- [Users Lookup](#users-lookup)
- [Follows Lookup](#follows-lookup)
- [Spaces](#spaces)
- [Lists](#lists)
- [Trends](#trends)
- [Communities](#communities)
- [Compliance](#compliance)
- [Usage](#usage)
- [Field Reference](#field-reference)

---

## Tweets Lookup

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/tweets` | Look up multiple tweets by ID | 3,500/15min |
| GET | `/2/tweets/:id` | Look up a single tweet by ID | 450/15min |

**Parameters:**
- `ids` (multi-lookup): Comma-separated tweet IDs, up to 100
- `tweet.fields`, `expansions`, `user.fields`, `media.fields`, `place.fields`, `poll.fields`

---

## Search Tweets

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/tweets/search/recent` | Search tweets from last 7 days | 450/15min |
| GET | `/2/tweets/search/all` | Full-archive search (Pro/Enterprise) | 300/15min, 1/sec |

**Parameters:**
- `query` (required): Up to 512 chars (Basic) or 1,024 chars (Pro/Enterprise)
- `start_time`, `end_time`: ISO 8601 timestamps
- `since_id`, `until_id`: Tweet ID boundaries
- `max_results`: 10–100 (recent), 10–500 (full-archive)
- `next_token`: Pagination token
- `sort_order`: `recency` or `relevancy`
- `tweet.fields`, `expansions`, `user.fields`, `media.fields`, `place.fields`, `poll.fields`

---

## Tweet Counts

**Bearer Token ONLY** — does not support user-context auth.

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/tweets/counts/recent` | Count tweets matching query (7 days) | 300/15min |
| GET | `/2/tweets/counts/all` | Count tweets matching query (all time) | 300/15min |

**Parameters:**
- `query` (required): Same syntax as search
- `start_time`, `end_time`: ISO 8601 timestamps
- `since_id`, `until_id`: Tweet ID boundaries
- `granularity`: `minute`, `hour` (default), or `day`
- `next_token`: Pagination

---

## Timelines

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/users/:id/tweets` | User's tweet timeline | 10,000/15min |
| GET | `/2/users/:id/mentions` | User's mention timeline | 450/15min |

**Parameters:**
- `start_time`, `end_time`, `since_id`, `until_id`
- `max_results`: 1–100
- `pagination_token`
- `exclude`: `retweets`, `replies` (comma-separated)
- `tweet.fields`, `expansions`, `user.fields`, `media.fields`, `place.fields`, `poll.fields`

**Not supported:** `/2/users/:id/timelines/reverse_chronological` (Home timeline) requires user context.

---

## Filtered Stream

**Bearer Token ONLY.**

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/tweets/search/stream` | Connect to real-time filtered stream | 50/15min |
| GET | `/2/tweets/search/stream/rules` | Retrieve current stream rules | 450/15min |
| POST | `/2/tweets/search/stream/rules` | Add or delete stream rules | 100/15min |

**Stream parameters:**
- `tweet.fields`, `expansions`, `user.fields`, `media.fields`, `place.fields`, `poll.fields`
- `backfill_minutes`: 1–5 (Pro/Enterprise)

**Rules management (POST body):**

Add rules:
```json
{"add": [{"value": "from:NASA has:media", "tag": "nasa-media"}]}
```

Delete rules:
```json
{"delete": {"ids": ["rule_id_1", "rule_id_2"]}}
```

Rule limits: 5 (Basic), 1,000 (Pro), custom (Enterprise). Each rule up to 512/1,024 chars.

---

## Sampled Streams

**Bearer Token ONLY.**

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/tweets/sample/stream` | ~1% random sample of all tweets | connection-based |
| GET | `/2/tweets/sample10/stream` | ~10% random sample (Enterprise) | 100/15min |

**Parameters:**
- `tweet.fields`, `expansions`, `user.fields`, `media.fields`, `place.fields`, `poll.fields`
- `backfill_minutes`: 1–5 (Enterprise)

---

## Retweets & Quote Tweets

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/tweets/:id/retweeted_by` | Users who retweeted a tweet | 75/15min |
| GET | `/2/tweets/:id/retweets` | Retweets of a tweet | 75/15min |
| GET | `/2/tweets/:id/quote_tweets` | Quote tweets of a tweet | 75/15min |

**Parameters:**
- `max_results`: 1–100
- `pagination_token`
- `user.fields` (retweeted_by), `tweet.fields`, `expansions`

---

## Likes Lookup

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/tweets/:id/liking_users` | Users who liked a tweet | 75/15min |
| GET | `/2/users/:id/liked_tweets` | Tweets liked by a user | 75/15min |

**Parameters:**
- `max_results`, `pagination_token`
- `tweet.fields`, `user.fields`, `expansions`, `media.fields`, `place.fields`, `poll.fields`

---

## Users Lookup

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/users` | Look up multiple users by ID | 300/15min |
| GET | `/2/users/:id` | Look up a single user by ID | 300/15min |
| GET | `/2/users/by` | Look up multiple users by username | 300/15min |
| GET | `/2/users/by/username/:username` | Look up a single user by username | 300/15min |
| GET | `/2/users/search` | Search for users | 300/15min |

**Parameters:**
- `ids` or `usernames` (multi-lookup): Comma-separated, up to 100
- `user.fields`: `created_at`, `description`, `entities`, `id`, `location`, `name`, `pinned_tweet_id`, `profile_image_url`, `profile_banner_url`, `protected`, `public_metrics`, `url`, `username`, `verified`, `verified_type`, `subscription_type`, `most_recent_tweet_id`, `affiliation`
- `expansions`: `pinned_tweet_id`
- `tweet.fields` (for expanded pinned tweet)

**Not supported:** `GET /2/users/me` returns 403 with Bearer Token (no user context).

---

## Follows Lookup

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/users/:id/following` | Users a user is following | 300/15min |
| GET | `/2/users/:id/followers` | Users who follow a user | 300/15min |

**Parameters:**
- `max_results`: 1–1,000
- `pagination_token`
- `user.fields`, `expansions`, `tweet.fields`

---

## Spaces

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/spaces/:id` | Look up a Space by ID | 300/15min |
| GET | `/2/spaces` | Look up multiple Spaces by ID | 300/15min |
| GET | `/2/spaces/by/creator_ids` | Spaces created by users | 300/15min (1/sec) |
| GET | `/2/spaces/search` | Search Spaces by title | 300/15min |
| GET | `/2/spaces/:id/tweets` | Tweets shared in a Space | 300/15min |

**Parameters:**
- `ids` or `user_ids` (multi-lookup)
- `query` (search)
- `state`: `live`, `scheduled`, `all`
- `space.fields`: `id`, `state`, `created_at`, `creator_id`, `ended_at`, `host_ids`, `invited_user_ids`, `is_ticketed`, `lang`, `participant_count`, `scheduled_start`, `speaker_ids`, `started_at`, `subscriber_count`, `title`, `topic_ids`, `updated_at`
- `expansions`: `creator_id`, `host_ids`, `invited_user_ids`, `speaker_ids`
- `user.fields`

---

## Lists

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/lists/:id` | Look up a List by ID | 75/15min |
| GET | `/2/users/:id/owned_lists` | Lists owned by a user | 15/15min |
| GET | `/2/lists/:id/tweets` | Tweets in a List | 900/15min |
| GET | `/2/lists/:id/members` | Members of a List | 900/15min |
| GET | `/2/users/:id/list_memberships` | Lists a user is a member of | 75/15min |
| GET | `/2/lists/:id/followers` | Followers of a List | 75/15min |
| GET | `/2/users/:id/followed_lists` | Lists a user follows | 75/15min |

**Parameters:**
- `max_results`, `pagination_token`
- `list.fields`: `id`, `name`, `created_at`, `description`, `follower_count`, `member_count`, `private`, `owner_id`
- `expansions`: `owner_id`
- `user.fields`, `tweet.fields`

**Not supported:** All write operations (create/delete/update lists, manage members, follow/unfollow/pin lists).

---

## Trends

**Bearer Token ONLY.**

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/trends/by/woeid/:id` | Trending topics for a WOEID location | 75/15min |

Common WOEIDs: 1 (Worldwide), 23424977 (US), 23424975 (UK), 23424856 (Japan).

---

## Communities

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/communities/:id` | Look up a Community by ID | 300/15min |
| GET | `/2/communities/search` | Search for Communities | 300/15min |

---

## Compliance

**Bearer Token ONLY.**

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/2/compliance/jobs` | Create a compliance job | 150/15min |
| GET | `/2/compliance/jobs/:job_id` | Get status of a compliance job | 150/15min |
| GET | `/2/compliance/jobs` | List all compliance jobs | 150/15min |

**POST body:**
- `type` (required): `tweets` or `users`
- `name`: Optional job name
- `resumable`: Boolean

---

## Usage

**Bearer Token ONLY.**

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/2/usage/tweets` | App's tweet consumption usage | 50/15min |

---

## Field Reference

### tweet.fields
`attachments`, `author_id`, `context_annotations`, `conversation_id`, `created_at`, `edit_controls`, `edit_history_tweet_ids`, `entities`, `geo`, `in_reply_to_user_id`, `lang`, `note_tweet`, `possibly_sensitive`, `public_metrics`, `referenced_tweets`, `reply_settings`, `text`, `withheld`

### user.fields
`created_at`, `description`, `entities`, `id`, `location`, `most_recent_tweet_id`, `name`, `pinned_tweet_id`, `profile_banner_url`, `profile_image_url`, `protected`, `public_metrics`, `subscription_type`, `url`, `username`, `verified`, `verified_type`

### media.fields
`alt_text`, `duration_ms`, `height`, `media_key`, `preview_image_url`, `public_metrics`, `type`, `url`, `variants`, `width`

### place.fields
`contained_within`, `country`, `country_code`, `full_name`, `geo`, `id`, `name`, `place_type`

### poll.fields
`duration_minutes`, `end_datetime`, `id`, `options`, `voting_status`

### space.fields
`created_at`, `creator_id`, `ended_at`, `host_ids`, `id`, `invited_user_ids`, `is_ticketed`, `lang`, `participant_count`, `scheduled_start`, `speaker_ids`, `started_at`, `state`, `subscriber_count`, `title`, `topic_ids`, `updated_at`

### list.fields
`created_at`, `description`, `follower_count`, `id`, `member_count`, `name`, `owner_id`, `private`

### Common expansions
- **Tweets**: `author_id`, `referenced_tweets.id`, `referenced_tweets.id.author_id`, `attachments.media_keys`, `attachments.poll_ids`, `geo.place_id`, `in_reply_to_user_id`, `entities.mentions.username`
- **Users**: `pinned_tweet_id`
- **Spaces**: `creator_id`, `host_ids`, `invited_user_ids`, `speaker_ids`
- **Lists**: `owner_id`
