import { describe, test, expect } from "bun:test";
import { fieldParams, applyFieldPreset } from "./api";

const XCLI = `${import.meta.dir}/xcli.ts`;

// @vibecodeapp — the vibecode Twitter account used as the canonical test fixture
const VC_USERNAME = "vibecodeapp";
const VC_USER_ID = "1895714633782083584";

// Helper: run xcli as subprocess, return { stdout, stderr, exitCode }
async function run(...args: string[]): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  const proc = Bun.spawn(["bun", "run", XCLI, ...args], {
    stdout: "pipe",
    stderr: "pipe",
    cwd: import.meta.dir,
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

// Helper: run and parse JSON from stdout, fail if non-zero exit
async function json(...args: string[]): Promise<any> {
  const r = await run(...args);
  if (r.exitCode !== 0) {
    throw new Error(`xcli exited ${r.exitCode}: ${r.stderr}`);
  }
  return JSON.parse(r.stdout);
}

// ---------------------------------------------------------------------------
// Unit: fieldParams
// ---------------------------------------------------------------------------
describe("fieldParams", () => {
  test("maps kebab-case flags to API params", () => {
    const p = fieldParams({
      "tweet-fields": "text,author_id",
      "max-results": "10",
      "page-token": "abc123",
    });
    expect(p).toEqual({
      "tweet.fields": "text,author_id",
      max_results: "10",
      pagination_token: "abc123",
    });
  });

  test("passes through unmapped flags as-is", () => {
    const p = fieldParams({ "tweet.fields": "text", custom: "val" });
    expect(p).toEqual({ "tweet.fields": "text", custom: "val" });
  });

  test("returns empty object for no flags", () => {
    expect(fieldParams({})).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Unit: applyFieldPreset
// ---------------------------------------------------------------------------
describe("applyFieldPreset", () => {
  test("expands tweets:full preset", () => {
    const params: Record<string, string> = {};
    applyFieldPreset("tweets", "full", params);
    expect(params["tweet.fields"]).toContain("author_id");
    expect(params["tweet.fields"]).toContain("created_at");
    expect(params["tweet.fields"]).toContain("public_metrics");
    expect(params["user.fields"]).toContain("username");
    expect(params.expansions).toContain("author_id");
    expect(params["media.fields"]).toContain("url");
  });

  test("expands users:full preset", () => {
    const params: Record<string, string> = {};
    applyFieldPreset("users", "full", params);
    expect(params["user.fields"]).toContain("public_metrics");
    expect(params["user.fields"]).toContain("description");
    expect(params["user.fields"]).toContain("location");
  });

  test("does not overwrite explicit flags", () => {
    const params: Record<string, string> = {
      "tweet.fields": "text",
    };
    applyFieldPreset("tweets", "full", params);
    // Explicit value should be preserved
    expect(params["tweet.fields"]).toBe("text");
    // Other preset fields should be added
    expect(params["user.fields"]).toContain("username");
  });

  test("dies on unknown preset", async () => {
    // applyFieldPreset calls die() which does process.exit(1), so test via subprocess
    const r = await run("tweets", "search", "test", "--fields", "bogus");
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("Unknown field preset");
  });
});

// ---------------------------------------------------------------------------
// CLI: arg parsing & usage
// ---------------------------------------------------------------------------
describe("cli basics", () => {
  test("no args prints usage and exits 1", async () => {
    const r = await run();
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toContain("Usage: xcli");
    expect(r.stderr).toContain("Examples:");
    expect(r.stdout).toBe("");
  });

  test("unknown resource exits 1", async () => {
    const r = await run("bogus");
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("Unknown resource: bogus");
  });

  test("unknown action exits 1", async () => {
    const r = await run("tweets", "bogus-action");
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("Unknown tweets action");
  });
});

// ---------------------------------------------------------------------------
// CLI: --help flag
// ---------------------------------------------------------------------------
describe("help", () => {
  test("--help exits 0 with usage", async () => {
    const r = await run("--help");
    expect(r.exitCode).toBe(0);
    expect(r.stderr).toContain("Examples:");
    expect(r.stderr).toContain("Usage: xcli");
  });

  test("-h exits 0", async () => {
    const r = await run("-h");
    expect(r.exitCode).toBe(0);
    expect(r.stderr).toContain("Examples:");
  });

  test("resource --help shows resource help", async () => {
    const r = await run("tweets", "--help");
    expect(r.exitCode).toBe(0);
    expect(r.stderr).toContain("xcli tweets");
    expect(r.stderr).toContain("Examples:");
    expect(r.stderr).toContain("search");
  });

  test("resource -h shows resource help", async () => {
    const r = await run("users", "-h");
    expect(r.exitCode).toBe(0);
    expect(r.stderr).toContain("xcli users");
    expect(r.stderr).toContain("by-username");
  });

  test("boolean flags don't consume next arg", async () => {
    // --help should not eat "tweets" as its value
    const r = await run("tweets", "--help");
    expect(r.exitCode).toBe(0);
    expect(r.stderr).not.toContain("Unknown");
  });
});

// ---------------------------------------------------------------------------
// Live API: usage
// ---------------------------------------------------------------------------
describe("usage", () => {
  test("returns tweet usage data", async () => {
    const data = await json("usage");
    expect(data.data).toBeDefined();
    expect(data.data.project_id).toBeString();
    expect(data.data.project_cap).toBeString();
  });
});

// ---------------------------------------------------------------------------
// Live API: tweets
// ---------------------------------------------------------------------------
describe("tweets", () => {
  test("search returns results", async () => {
    const data = await json("tweets", "search", "from:vibecodeapp", "--max-results", "10");
    expect(data.data).toBeArray();
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0].id).toBeString();
    expect(data.data[0].text).toBeString();
    expect(data.meta).toBeDefined();
  });

  test("search with --tweet-fields expands fields", async () => {
    const data = await json(
      "tweets", "search", "from:vibecodeapp",
      "--max-results", "10",
      "--tweet-fields", "author_id,created_at",
    );
    expect(data.data[0].author_id).toBe(VC_USER_ID);
    expect(data.data[0].created_at).toBeString();
  });

  test("lookup single tweet", async () => {
    // Grab a tweet ID from vibecodeapp's recent tweets
    const search = await json("tweets", "search", "from:vibecodeapp", "--max-results", "10");
    const id = search.data[0].id;

    const data = await json("tweets", "lookup", id);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBe(id);
    expect(data.data.text).toBeString();
  });

  test("lookup multiple tweets (comma-separated)", async () => {
    const search = await json("tweets", "search", "from:vibecodeapp", "--max-results", "10");
    const ids = search.data.slice(0, 3).map((t: any) => t.id).join(",");

    const data = await json("tweets", "lookup", ids);
    expect(data.data).toBeArray();
    expect(data.data.length).toBe(3);
  });

  test("counts returns count data", async () => {
    const data = await json("tweets", "counts", "from:vibecodeapp");
    expect(data.data).toBeArray();
    expect(data.meta).toBeDefined();
    expect(data.meta.total_tweet_count).toBeNumber();
  });

  test("timeline returns user tweets", async () => {
    const data = await json("tweets", "timeline", VC_USER_ID, "--max-results", "10");
    expect(data.data).toBeArray();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test("mentions returns user mentions", async () => {
    const data = await json("tweets", "mentions", VC_USER_ID, "--max-results", "10");
    expect(data.data).toBeArray();
  });

  test("missing positional arg exits 1", async () => {
    const r = await run("tweets", "lookup");
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("Usage:");
  });
});

// ---------------------------------------------------------------------------
// Live API: users
// ---------------------------------------------------------------------------
describe("users", () => {
  test("by-username single", async () => {
    const data = await json("users", "by-username", VC_USERNAME);
    expect(data.data.username).toBe(VC_USERNAME);
    expect(data.data.id).toBe(VC_USER_ID);
    expect(data.data.name).toBeString();
  });

  test("by-username multiple (comma-separated)", async () => {
    const data = await json("users", "by-username", `${VC_USERNAME},learn2vibe`);
    expect(data.data).toBeArray();
    expect(data.data.length).toBe(2);
  });

  test("by-username with --user-fields", async () => {
    const data = await json(
      "users", "by-username", VC_USERNAME,
      "--user-fields", "public_metrics,description",
    );
    expect(data.data.public_metrics).toBeDefined();
    expect(data.data.public_metrics.followers_count).toBeNumber();
    expect(data.data.description).toBeString();
  });

  test("lookup by ID", async () => {
    const data = await json("users", "lookup", VC_USER_ID);
    expect(data.data.id).toBe(VC_USER_ID);
    expect(data.data.username).toBe(VC_USERNAME);
  });

  test("lookup multiple IDs", async () => {
    const users = await json("users", "by-username", `${VC_USERNAME},learn2vibe`);
    const ids = users.data.map((u: any) => u.id).join(",");

    const data = await json("users", "lookup", ids);
    expect(data.data).toBeArray();
    expect(data.data.length).toBe(2);
  });

  test("followers returns follower list", async () => {
    const data = await json("users", "followers", VC_USER_ID, "--max-results", "10");
    expect(data.data).toBeArray();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test("following returns following list", async () => {
    const data = await json("users", "following", VC_USER_ID, "--max-results", "10");
    expect(data.data).toBeArray();
    expect(data.data.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Live API: streams
// ---------------------------------------------------------------------------
describe("streams", () => {
  test("rules-list returns rules array or empty", async () => {
    const data = await json("streams", "rules-list");
    expect(data.meta).toBeDefined();
    expect(data.meta.sent).toBeString();
  });

  test("rules-add and rules-delete round-trip", async () => {
    // Add a rule
    const tag = `test-${Date.now()}`;
    const add = await json("streams", "rules-add", "from:vibecodeapp", "--tag", tag);
    expect(add.data).toBeArray();
    expect(add.data.length).toBe(1);
    const ruleId = add.data[0].id;
    expect(ruleId).toBeString();
    expect(add.data[0].tag).toBe(tag);

    // Verify it shows in list
    const list = await json("streams", "rules-list");
    const found = list.data?.find((r: any) => r.id === ruleId);
    expect(found).toBeDefined();

    // Delete it
    const del = await json("streams", "rules-delete", ruleId);
    expect(del.meta.summary.deleted).toBe(1);

    // Verify it's gone
    const list2 = await json("streams", "rules-list");
    const notFound = list2.data?.find((r: any) => r.id === ruleId);
    expect(notFound).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Live API: trends
// ---------------------------------------------------------------------------
describe("trends", () => {
  test("returns trends for US (woeid 23424977)", async () => {
    const data = await json("trends", "23424977");
    expect(data.data).toBeArray();
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0].trend_name).toBeString();
  });

  test("non-numeric woeid exits 1", async () => {
    const r = await run("trends", "abc");
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("Usage: trends");
  });
});

// ---------------------------------------------------------------------------
// Live API: lists
// ---------------------------------------------------------------------------
describe("lists", () => {
  test("owned returns lists for a user", async () => {
    const data = await json("lists", "owned", VC_USER_ID);
    expect(data).toBeDefined();
    // vibecodeapp may or may not have public lists, just check shape
    if (data.data) {
      expect(data.data).toBeArray();
    }
  });
});

// ---------------------------------------------------------------------------
// Live API: spaces
// ---------------------------------------------------------------------------
describe("spaces", () => {
  test("search returns results or empty", async () => {
    const data = await json("spaces", "search", "music");
    expect(data).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Live API: compliance
// ---------------------------------------------------------------------------
describe("compliance", () => {
  test("list returns compliance jobs (may require elevated access)", async () => {
    const r = await run("compliance", "list", "--type", "tweets");
    // 403 is expected for basic tokens — just verify the CLI handles it
    expect(r.exitCode === 0 || r.stderr.includes("HTTP 403")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output format
// ---------------------------------------------------------------------------
describe("output format", () => {
  test("stdout is compact JSON by default", async () => {
    const r = await run("usage");
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout.trim());
    // Compact = single line (no newlines within the JSON itself)
    expect(r.stdout.trim()).toBe(JSON.stringify(parsed));
  });

  test("--pretty outputs indented JSON", async () => {
    const r = await run("usage", "--pretty");
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(r.stdout).toContain("\n");
    expect(r.stdout).toContain("  ");
    expect(r.stdout.trim()).toBe(JSON.stringify(parsed, null, 2));
  });

  test("errors go to stderr, not stdout", async () => {
    const r = await run("tweets", "lookup");
    expect(r.exitCode).not.toBe(0);
    expect(r.stdout).toBe("");
    expect(r.stderr.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// --fields preset (live API)
// ---------------------------------------------------------------------------
describe("--fields preset", () => {
  test("--fields full expands tweet fields", async () => {
    const data = await json(
      "tweets", "search", "from:vibecodeapp",
      "--max-results", "10",
      "--fields", "full",
    );
    expect(data.data).toBeArray();
    expect(data.data[0].author_id).toBeString();
    expect(data.data[0].created_at).toBeString();
    expect(data.includes).toBeDefined();
  });

  test("--fields full expands user fields", async () => {
    const data = await json(
      "users", "by-username", VC_USERNAME,
      "--fields", "full",
    );
    expect(data.data.public_metrics).toBeDefined();
    expect(data.data.description).toBeString();
  });
});
