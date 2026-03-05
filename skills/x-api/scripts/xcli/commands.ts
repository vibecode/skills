// commands.ts — Handler functions for each X API resource.
// Each handler receives parsed CLI args and calls request() or stream().

import { request, stream, fieldParams, die } from "./api";
import type { ParsedArgs } from "./types";

/**
 * Tweets: lookup, search, counts, timelines, retweets, quotes, likes.
 * Comma-separated IDs auto-switch between single and multi endpoints.
 * Search/count endpoints remap --page-token to next_token (X API quirk).
 */
export async function handleTweets(args: ParsedArgs): Promise<unknown> {
  const { action, positional: pos, flags } = args;
  const params = fieldParams(flags);

  switch (action) {
    case "lookup": {
      const id = pos[0];
      if (!id) die("Usage: tweets lookup <id|id1,id2,...>");
      // Comma = multi-lookup via query param; otherwise single by path
      if (id.includes(",")) {
        params.ids = id;
        return request({ path: "/tweets", params });
      }
      return request({ path: `/tweets/${id}`, params });
    }
    case "search": {
      const q = pos[0] ?? flags.query;
      if (!q) die("Usage: tweets search <query>");
      params.query = q;
      // Search endpoints use next_token, not pagination_token
      if (params.pagination_token) {
        params.next_token = params.pagination_token;
        delete params.pagination_token;
      }
      return request({ path: "/tweets/search/recent", params });
    }
    case "search-all": {
      const q = pos[0] ?? flags.query;
      if (!q) die("Usage: tweets search-all <query>");
      params.query = q;
      if (params.pagination_token) {
        params.next_token = params.pagination_token;
        delete params.pagination_token;
      }
      return request({ path: "/tweets/search/all", params });
    }
    case "counts": {
      const q = pos[0] ?? flags.query;
      if (!q) die("Usage: tweets counts <query>");
      params.query = q;
      if (params.pagination_token) {
        params.next_token = params.pagination_token;
        delete params.pagination_token;
      }
      return request({ path: "/tweets/counts/recent", params });
    }
    case "counts-all": {
      const q = pos[0] ?? flags.query;
      if (!q) die("Usage: tweets counts-all <query>");
      params.query = q;
      if (params.pagination_token) {
        params.next_token = params.pagination_token;
        delete params.pagination_token;
      }
      return request({ path: "/tweets/counts/all", params });
    }
    case "timeline": {
      const uid = pos[0];
      if (!uid) die("Usage: tweets timeline <user-id>");
      return request({ path: `/users/${uid}/tweets`, params });
    }
    case "mentions": {
      const uid = pos[0];
      if (!uid) die("Usage: tweets mentions <user-id>");
      return request({ path: `/users/${uid}/mentions`, params });
    }
    case "retweeted-by": {
      const tid = pos[0];
      if (!tid) die("Usage: tweets retweeted-by <tweet-id>");
      return request({ path: `/tweets/${tid}/retweeted_by`, params });
    }
    case "retweets": {
      const tid = pos[0];
      if (!tid) die("Usage: tweets retweets <tweet-id>");
      return request({ path: `/tweets/${tid}/retweets`, params });
    }
    case "quote-tweets": {
      const tid = pos[0];
      if (!tid) die("Usage: tweets quote-tweets <tweet-id>");
      return request({ path: `/tweets/${tid}/quote_tweets`, params });
    }
    case "liking-users": {
      const tid = pos[0];
      if (!tid) die("Usage: tweets liking-users <tweet-id>");
      return request({ path: `/tweets/${tid}/liking_users`, params });
    }
    case "liked-tweets": {
      const uid = pos[0];
      if (!uid) die("Usage: tweets liked-tweets <user-id>");
      return request({ path: `/users/${uid}/liked_tweets`, params });
    }
    default:
      die(`Unknown tweets action: ${action}\nActions: lookup, search, search-all, counts, counts-all, timeline, mentions, retweeted-by, retweets, quote-tweets, liking-users, liked-tweets`);
  }
}

/**
 * Streams: filtered stream, sampled stream, and stream rule management.
 * connect/sample/sample10 use the streaming client (long-lived connection).
 * rules-add/rules-delete use POST requests.
 */
export async function handleStreams(args: ParsedArgs): Promise<unknown> {
  const { action, flags } = args;
  const params = fieldParams(flags);

  switch (action) {
    case "connect":
      return stream({ path: "/tweets/search/stream", params });
    case "sample":
      return stream({ path: "/tweets/sample/stream", params });
    case "sample10":
      return stream({ path: "/tweets/sample10/stream", params });
    case "rules-list":
      return request({ path: "/tweets/search/stream/rules" });
    case "rules-add": {
      const value = args.positional[0];
      const tag = flags.tag;
      if (!value) die("Usage: streams rules-add <rule-value> [--tag <tag>]");
      const rule: Record<string, string> = { value };
      if (tag) rule.tag = tag;
      return request({
        path: "/tweets/search/stream/rules",
        method: "POST",
        body: { add: [rule] },
      });
    }
    case "rules-delete": {
      // Accepts comma-separated rule IDs
      const ids = args.positional[0];
      if (!ids) die("Usage: streams rules-delete <id1,id2,...>");
      return request({
        path: "/tweets/search/stream/rules",
        method: "POST",
        body: { delete: { ids: ids.split(",") } },
      });
    }
    default:
      die(`Unknown streams action: ${action}\nActions: connect, sample, sample10, rules-list, rules-add, rules-delete`);
  }
}

/**
 * Users: lookup by ID or username, search, followers, following.
 * Comma-separated values auto-switch between single and multi endpoints.
 */
export async function handleUsers(args: ParsedArgs): Promise<unknown> {
  const { action, positional: pos, flags } = args;
  const params = fieldParams(flags);

  switch (action) {
    case "lookup": {
      const id = pos[0];
      if (!id) die("Usage: users lookup <id|id1,id2,...>");
      if (id.includes(",")) {
        params.ids = id;
        return request({ path: "/users", params });
      }
      return request({ path: `/users/${id}`, params });
    }
    case "by-username": {
      const name = pos[0];
      if (!name) die("Usage: users by-username <username|u1,u2,...>");
      if (name.includes(",")) {
        params.usernames = name;
        return request({ path: "/users/by", params });
      }
      return request({ path: `/users/by/username/${name}`, params });
    }
    case "search": {
      const q = pos[0] ?? flags.query;
      if (!q) die("Usage: users search <query>");
      params.query = q;
      return request({ path: "/users/search", params });
    }
    case "followers": {
      const uid = pos[0];
      if (!uid) die("Usage: users followers <user-id>");
      return request({ path: `/users/${uid}/followers`, params });
    }
    case "following": {
      const uid = pos[0];
      if (!uid) die("Usage: users following <user-id>");
      return request({ path: `/users/${uid}/following`, params });
    }
    default:
      die(`Unknown users action: ${action}\nActions: lookup, by-username, search, followers, following`);
  }
}

/** Spaces: lookup, search, by-creator, tweets shared in a space. */
export async function handleSpaces(args: ParsedArgs): Promise<unknown> {
  const { action, positional: pos, flags } = args;
  const params = fieldParams(flags);

  switch (action) {
    case "lookup": {
      const id = pos[0];
      if (!id) die("Usage: spaces lookup <id|id1,id2,...>");
      if (id.includes(",")) {
        params.ids = id;
        return request({ path: "/spaces", params });
      }
      return request({ path: `/spaces/${id}`, params });
    }
    case "by-creator": {
      const uids = pos[0];
      if (!uids) die("Usage: spaces by-creator <user-id1,user-id2,...>");
      params.user_ids = uids;
      return request({ path: "/spaces/by/creator_ids", params });
    }
    case "search": {
      const q = pos[0] ?? flags.query;
      if (!q) die("Usage: spaces search <query>");
      params.query = q;
      return request({ path: "/spaces/search", params });
    }
    case "tweets": {
      const sid = pos[0];
      if (!sid) die("Usage: spaces tweets <space-id>");
      return request({ path: `/spaces/${sid}/tweets`, params });
    }
    default:
      die(`Unknown spaces action: ${action}\nActions: lookup, by-creator, search, tweets`);
  }
}

/** Lists: lookup, owned lists, tweets, members, memberships, followers. */
export async function handleLists(args: ParsedArgs): Promise<unknown> {
  const { action, positional: pos, flags } = args;
  const params = fieldParams(flags);

  switch (action) {
    case "lookup": {
      const id = pos[0];
      if (!id) die("Usage: lists lookup <list-id>");
      return request({ path: `/lists/${id}`, params });
    }
    case "owned": {
      const uid = pos[0];
      if (!uid) die("Usage: lists owned <user-id>");
      return request({ path: `/users/${uid}/owned_lists`, params });
    }
    case "tweets": {
      const id = pos[0];
      if (!id) die("Usage: lists tweets <list-id>");
      return request({ path: `/lists/${id}/tweets`, params });
    }
    case "members": {
      const id = pos[0];
      if (!id) die("Usage: lists members <list-id>");
      return request({ path: `/lists/${id}/members`, params });
    }
    case "memberships": {
      const uid = pos[0];
      if (!uid) die("Usage: lists memberships <user-id>");
      return request({ path: `/users/${uid}/list_memberships`, params });
    }
    case "followers": {
      const id = pos[0];
      if (!id) die("Usage: lists followers <list-id>");
      return request({ path: `/lists/${id}/followers`, params });
    }
    case "followed": {
      const uid = pos[0];
      if (!uid) die("Usage: lists followed <user-id>");
      return request({ path: `/users/${uid}/followed_lists`, params });
    }
    default:
      die(`Unknown lists action: ${action}\nActions: lookup, owned, tweets, members, memberships, followers, followed`);
  }
}

/** Trends: single endpoint, action IS the WOEID number. */
export async function handleTrends(args: ParsedArgs): Promise<unknown> {
  const woeid = args.action;
  if (!woeid || !/^\d+$/.test(woeid)) die("Usage: trends <woeid>");
  const params = fieldParams(args.flags);
  return request({ path: `/trends/by/woeid/${woeid}`, params });
}

/** Communities: lookup by ID or search. */
export async function handleCommunities(args: ParsedArgs): Promise<unknown> {
  const { action, positional: pos, flags } = args;
  const params = fieldParams(flags);

  switch (action) {
    case "lookup": {
      const id = pos[0];
      if (!id) die("Usage: communities lookup <id>");
      return request({ path: `/communities/${id}`, params });
    }
    case "search": {
      const q = pos[0] ?? flags.query;
      if (!q) die("Usage: communities search <query>");
      params.query = q;
      return request({ path: "/communities/search", params });
    }
    default:
      die(`Unknown communities action: ${action}\nActions: lookup, search`);
  }
}

/** Compliance: create/get/list batch compliance jobs. Bearer-only. */
export async function handleCompliance(args: ParsedArgs): Promise<unknown> {
  const { action, positional: pos, flags } = args;
  const params = fieldParams(flags);

  switch (action) {
    case "create": {
      const type = flags.type;
      if (!type) die("Usage: compliance create --type <tweets|users>");
      return request({
        path: "/compliance/jobs",
        method: "POST",
        body: { type },
      });
    }
    case "get": {
      const id = pos[0];
      if (!id) die("Usage: compliance get <job-id>");
      return request({ path: `/compliance/jobs/${id}`, params });
    }
    case "list":
      if (!params.type && flags.type) params.type = flags.type;
      return request({ path: "/compliance/jobs", params });
    default:
      die(`Unknown compliance action: ${action}\nActions: create, get, list`);
  }
}

/** Usage: app tweet consumption stats. Single endpoint, no action needed. */
export async function handleUsage(args: ParsedArgs): Promise<unknown> {
  const params = fieldParams(args.flags);
  return request({ path: "/usage/tweets", params });
}
