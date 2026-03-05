// xcli.ts — Entry point for the X API v2 CLI.
// Parses args, routes to the appropriate resource handler.
// Usage: bun run xcli.ts <resource> <action> [args] [--flags]

import type { ParsedArgs } from "./types";
import {
  handleTweets,
  handleStreams,
  handleUsers,
  handleSpaces,
  handleLists,
  handleTrends,
  handleCommunities,
  handleCompliance,
  handleUsage,
} from "./commands";
import { die, formatOutput, applyFieldPreset } from "./api";

/** Flags that are boolean (don't consume the next arg as a value). */
const BOOLEAN_FLAGS = new Set(["help", "h", "raw", "pretty"]);

/**
 * Hand-rolled arg parser. Bun.argv = [runtime, script, ...userArgs].
 * First user arg = resource, second = action, then --key value flags
 * and bare positional args. Boolean flags don't consume a value.
 */
function parseArgs(argv: string[]): ParsedArgs {
  const raw = argv.slice(2);
  const resource = raw[0] ?? "";
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  // Determine action: if raw[1] is a flag, there's no action
  let action = "";
  let i = 2;
  if (raw[1] && !raw[1].startsWith("-")) {
    action = raw[1];
  } else if (raw[1]) {
    // raw[1] is a flag — parse it as part of the flag loop
    i = 1;
  }

  while (i < raw.length) {
    const arg = raw[i]!;
    if (arg === "-h") {
      flags.help = "true";
      i++;
    } else if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (BOOLEAN_FLAGS.has(key)) {
        flags[key] = "true";
        i++;
      } else {
        const val = raw[i + 1] ?? "";
        flags[key] = val;
        i += 2;
      }
    } else {
      positional.push(arg);
      i++;
    }
  }
  return { resource, action, positional, flags };
}

function printUsage(): void {
  console.error(`Examples:
  bun xcli tweets search "from:vibecodeapp" --max-results 10
  bun xcli users by-username vibecodeapp --fields full --pretty
  bun xcli trends 23424977
  bun xcli tweets --help

Usage: xcli <resource> <action> [args] [--flags]

Resources:
  tweets      lookup, search, search-all, counts, counts-all,
              timeline, mentions, retweeted-by, retweets,
              quote-tweets, liking-users, liked-tweets
  streams     connect, sample, sample10, rules-list, rules-add, rules-delete
  users       lookup, by-username, search, followers, following
  spaces      lookup, by-creator, search, tweets
  lists       lookup, owned, tweets, members, memberships, followers, followed
  trends      <woeid>
  communities lookup, search
  compliance  create, get, list
  usage       (no action needed)

Flags:
  --fields        Field preset (e.g. "full") — expands common fields/expansions
  --pretty        Pretty-print JSON output (default: compact)
  --tweet-fields  --user-fields     --media-fields
  --place-fields  --poll-fields     --space-fields
  --list-fields   --expansions      --max-results
  --page-token    --start-time      --end-time
  --since-id      --until-id        --granularity
  --sort-order    --query

Environment:
  X_BEARER_TOKEN    Required. App-only bearer token.`);
}

/** Per-resource help text. Keyed by resource name. */
const RESOURCE_HELP: Record<string, string> = {
  tweets: `Examples:
  bun xcli tweets search "from:NASA -is:retweet" --max-results 50
  bun xcli tweets search "from:elonmusk" --fields full --pretty
  bun xcli tweets lookup 123456789
  bun xcli tweets timeline USER_ID --max-results 10
  bun xcli tweets counts "from:NASA" --granularity day

Actions:
  lookup        Look up tweet(s) by ID. Comma-separated IDs for multi-lookup.
  search        Search recent tweets (last 7 days).
  search-all    Search full archive (Pro/Enterprise).
  counts        Count recent tweets matching a query.
  counts-all    Count all tweets matching a query (Pro/Enterprise).
  timeline      Get a user's tweets by user ID.
  mentions      Get a user's mentions by user ID.
  retweeted-by  Get users who retweeted a tweet.
  retweets      Get retweets of a tweet.
  quote-tweets  Get quote tweets of a tweet.
  liking-users  Get users who liked a tweet.
  liked-tweets  Get tweets liked by a user.

Flags: --tweet-fields, --user-fields, --media-fields, --expansions,
       --max-results, --page-token, --start-time, --end-time,
       --since-id, --until-id, --granularity, --sort-order, --fields, --pretty`,

  streams: `Examples:
  bun xcli streams rules-list
  bun xcli streams rules-add "#AI lang:en" --tag ai-english
  bun xcli streams rules-delete RULE_ID
  bun xcli streams connect --tweet-fields created_at --expansions author_id

Actions:
  connect       Connect to filtered stream (real-time, long-lived).
  sample        Connect to ~1% sampled stream.
  sample10      Connect to ~10% sampled stream (Enterprise).
  rules-list    List current stream filter rules.
  rules-add     Add a stream filter rule. Usage: rules-add <value> [--tag <tag>]
  rules-delete  Delete rules by ID. Usage: rules-delete <id1,id2,...>

Flags: --tweet-fields, --user-fields, --media-fields, --expansions, --tag, --fields, --pretty`,

  users: `Examples:
  bun xcli users by-username vibecodeapp --fields full --pretty
  bun xcli users by-username elonmusk,NASA --user-fields public_metrics
  bun xcli users lookup 44196397
  bun xcli users followers USER_ID --max-results 100

Actions:
  lookup       Look up user(s) by ID. Comma-separated IDs for multi-lookup.
  by-username  Look up user(s) by username. Comma-separated for multi-lookup.
  search       Search users by query.
  followers    Get a user's followers by user ID.
  following    Get who a user follows by user ID.

Flags: --user-fields, --tweet-fields, --expansions, --max-results, --page-token, --fields, --pretty`,

  spaces: `Examples:
  bun xcli spaces search "music"
  bun xcli spaces lookup SPACE_ID --fields full --pretty
  bun xcli spaces by-creator USER_ID1,USER_ID2

Actions:
  lookup      Look up space(s) by ID. Comma-separated IDs for multi-lookup.
  by-creator  Find spaces by creator user IDs.
  search      Search spaces by query.
  tweets      Get tweets shared in a space.

Flags: --space-fields, --user-fields, --expansions, --fields, --pretty`,

  lists: `Examples:
  bun xcli lists owned USER_ID
  bun xcli lists tweets LIST_ID --max-results 50
  bun xcli lists lookup LIST_ID --fields full --pretty
  bun xcli lists members LIST_ID

Actions:
  lookup       Look up a list by ID.
  owned        Get lists owned by a user.
  tweets       Get tweets from a list.
  members      Get members of a list.
  memberships  Get lists a user is a member of.
  followers    Get followers of a list.
  followed     Get lists a user follows.

Flags: --list-fields, --user-fields, --tweet-fields, --expansions, --max-results, --page-token, --fields, --pretty`,

  trends: `Examples:
  bun xcli trends 23424977
  bun xcli trends 1

Actions:
  <woeid>  Get trends for a Where On Earth ID. US = 23424977, Worldwide = 1.

No additional flags.`,

  communities: `Examples:
  bun xcli communities lookup COMMUNITY_ID
  bun xcli communities search "tech"

Actions:
  lookup  Look up a community by ID.
  search  Search communities by query.

Flags: --max-results, --fields, --pretty`,

  compliance: `Examples:
  bun xcli compliance create --type tweets
  bun xcli compliance list --type tweets
  bun xcli compliance get JOB_ID

Actions:
  create  Create a compliance job. Requires --type <tweets|users>.
  get     Get a compliance job by ID.
  list    List compliance jobs. Use --type to filter.

Flags: --type, --fields, --pretty`,

  usage: `Examples:
  bun xcli usage
  bun xcli usage --pretty

No action needed. Returns app tweet consumption stats.`,
};

function printResourceHelp(resource: string): void {
  const help = RESOURCE_HELP[resource];
  if (!help) {
    die(`Unknown resource: ${resource}`);
  }
  console.error(`xcli ${resource}\n\n${help}`);
}

/** Route resource to its handler. */
async function main(): Promise<void> {
  const args = parseArgs(Bun.argv);

  // Global help: no args, --help, or -h as resource
  if (!args.resource || args.resource === "--help" || args.resource === "-h") {
    printUsage();
    process.exit(args.resource ? 0 : 1);
  }

  // Global --help flag with no resource action context
  if (args.flags.help === "true" && !args.action) {
    printResourceHelp(args.resource);
    process.exit(0);
  }

  // Per-resource help: action is --help/-h, or --help flag with resource
  if (
    args.action === "--help" ||
    args.action === "-h" ||
    (args.flags.help === "true" && args.action)
  ) {
    printResourceHelp(args.resource);
    process.exit(0);
  }

  // Extract meta-flags before dispatch
  const pretty = args.flags.pretty === "true";
  const fieldsPreset = args.flags.fields;
  delete args.flags.help;
  delete args.flags.pretty;
  delete args.flags.raw;
  delete args.flags.fields;

  // Apply field preset if requested
  if (fieldsPreset) {
    applyFieldPreset(args.resource, fieldsPreset, args.flags);
  }

  let result: unknown;
  switch (args.resource) {
    case "tweets":
      result = await handleTweets(args);
      break;
    case "streams":
      result = await handleStreams(args);
      break;
    case "users":
      result = await handleUsers(args);
      break;
    case "spaces":
      result = await handleSpaces(args);
      break;
    case "lists":
      result = await handleLists(args);
      break;
    case "trends":
      result = await handleTrends(args);
      break;
    case "communities":
      result = await handleCommunities(args);
      break;
    case "compliance":
      result = await handleCompliance(args);
      break;
    case "usage":
      result = await handleUsage(args);
      break;
    default:
      die(`Unknown resource: ${args.resource}`);
  }

  if (result !== undefined) {
    console.log(formatOutput(result, pretty));
  }
}

main();
