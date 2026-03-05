// api.ts — HTTP client for X API v2.
// Handles auth, REST requests, streaming connections, and CLI flag-to-query-param mapping.

const BASE = "https://api.x.com/2";

/** Print error to stderr and exit. */
export function die(msg: string): never {
  console.error(msg);
  process.exit(1);
}

/** Read bearer token from X_BEARER_TOKEN env var (Bun auto-loads .env). */
export function getToken(): string {
  const t = process.env.X_BEARER_TOKEN;
  if (!t) die("X_BEARER_TOKEN not set");
  return t!;
}

type RequestOpts = {
  path: string;
  params?: Record<string, string>;
  method?: string;
  body?: unknown;
};

/**
 * Make a REST API call and return the parsed JSON response.
 * On 429, reports when the rate limit resets. Other errors go to stderr.
 */
export async function request(opts: RequestOpts): Promise<unknown> {
  const url = new URL(`${BASE}${opts.path}`);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });
  if (res.status === 429) {
    const reset = res.headers.get("x-rate-limit-reset");
    const msg = reset
      ? `Rate limited. Resets at ${new Date(Number(reset) * 1000).toISOString()}`
      : "Rate limited.";
    die(msg);
  }
  if (!res.ok) {
    const text = await res.text();
    die(`HTTP ${res.status}: ${text}`);
  }
  return await res.json();
}

/** Format data as JSON string. Compact by default, indented with pretty=true. */
export function formatOutput(data: unknown, pretty: boolean): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Field presets for common expansions. Keyed by "resource:preset".
 * Only "full" preset for now. Returns params to merge into the request.
 */
const FIELD_PRESETS: Record<string, Record<string, string>> = {
  "tweets:full": {
    "tweet.fields": "author_id,created_at,public_metrics,entities,conversation_id,lang,referenced_tweets,context_annotations",
    "user.fields": "created_at,description,public_metrics,profile_image_url,username,verified,verified_type",
    "media.fields": "url,preview_image_url,type,alt_text,duration_ms,height,width,public_metrics,variants",
    expansions: "author_id,referenced_tweets.id,attachments.media_keys",
  },
  "users:full": {
    "user.fields": "created_at,description,public_metrics,profile_image_url,username,verified,verified_type,location",
  },
  "spaces:full": {
    "space.fields": "created_at,host_ids,lang,participant_count,scheduled_start,speaker_ids,state,title,topic_ids,updated_at",
    expansions: "creator_id",
    "user.fields": "created_at,description,public_metrics,profile_image_url,username,verified",
  },
  "lists:full": {
    "list.fields": "created_at,description,follower_count,member_count,owner_id,private",
    expansions: "owner_id",
    "user.fields": "created_at,description,public_metrics,profile_image_url,username,verified",
  },
};

/**
 * Apply a field preset to params. Explicit flags take precedence (no overwrite).
 * Dies on unknown preset.
 */
export function applyFieldPreset(
  resource: string,
  preset: string,
  params: Record<string, string>,
): void {
  const key = `${resource}:${preset}`;
  const presetParams = FIELD_PRESETS[key];
  if (!presetParams) die(`Unknown field preset: ${key}`);
  for (const [k, v] of Object.entries(presetParams!)) {
    if (!(k in params)) {
      params[k] = v;
    }
  }
}

/**
 * Connect to a streaming endpoint and print each JSON line as it arrives.
 * Heartbeat lines (empty) are filtered out. Handles chunked transfer with
 * a line buffer so partial lines aren't emitted prematurely.
 */
export async function stream(opts: RequestOpts): Promise<void> {
  const url = new URL(`${BASE}${opts.path}`);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const text = await res.text();
    die(`HTTP ${res.status}: ${text}`);
  }
  const reader = res.body?.getReader();
  if (!reader) die("No response body");
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    // Split on newlines; last element is the incomplete tail we keep buffered
    const lines = buf.split("\n");
    buf = lines.pop()!;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) console.log(trimmed); // skip heartbeat empty lines
    }
  }
  if (buf.trim()) console.log(buf.trim());
}

/**
 * Maps CLI flag names (kebab-case) to X API query parameter names.
 * e.g. --tweet-fields → tweet.fields, --max-results → max_results
 * Unmapped flags pass through as-is (supports dot notation like tweet.fields directly).
 */
const FLAG_MAP: Record<string, string> = {
  "tweet-fields": "tweet.fields",
  "user-fields": "user.fields",
  "media-fields": "media.fields",
  "place-fields": "place.fields",
  "poll-fields": "poll.fields",
  "space-fields": "space.fields",
  "topic-fields": "topic.fields",
  "list-fields": "list.fields",
  expansions: "expansions",
  "max-results": "max_results",
  "page-token": "pagination_token",
  "start-time": "start_time",
  "end-time": "end_time",
  "since-id": "since_id",
  "until-id": "until_id",
  granularity: "granularity",
  "sort-order": "sort_order",
  query: "query",
};

export function fieldParams(flags: Record<string, string>): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(flags)) {
    const mapped = FLAG_MAP[k];
    if (mapped) {
      params[mapped] = v;
    } else {
      params[k] = v;
    }
  }
  return params;
}
