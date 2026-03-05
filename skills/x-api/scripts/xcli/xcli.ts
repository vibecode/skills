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
import { die } from "./api";

/**
 * Hand-rolled arg parser. Bun.argv = [runtime, script, ...userArgs].
 * First user arg = resource, second = action, then --key value flags
 * and bare positional args.
 */
function parseArgs(argv: string[]): ParsedArgs {
  const raw = argv.slice(2);
  const resource = raw[0] ?? "";
  const action = raw[1] ?? "";
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  let i = 2;
  while (i < raw.length) {
    const arg = raw[i]!;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const val = raw[i + 1] ?? "";
      flags[key] = val;
      i += 2;
    } else {
      positional.push(arg);
      i++;
    }
  }
  return { resource, action, positional, flags };
}

function printUsage(): void {
  console.error(`Usage: xcli <resource> <action> [args] [--flags]

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
  --tweet-fields    --user-fields     --media-fields
  --place-fields    --poll-fields     --space-fields
  --list-fields     --expansions      --max-results
  --page-token      --start-time      --end-time
  --since-id        --until-id        --granularity
  --sort-order      --query

Environment:
  X_BEARER_TOKEN    Required. App-only bearer token.`);
}

/** Route resource to its handler. */
async function main(): Promise<void> {
  const args = parseArgs(Bun.argv);

  if (!args.resource) {
    printUsage();
    process.exit(1);
  }

  switch (args.resource) {
    case "tweets":
      return handleTweets(args);
    case "streams":
      return handleStreams(args);
    case "users":
      return handleUsers(args);
    case "spaces":
      return handleSpaces(args);
    case "lists":
      return handleLists(args);
    case "trends":
      return handleTrends(args);
    case "communities":
      return handleCommunities(args);
    case "compliance":
      return handleCompliance(args);
    case "usage":
      return handleUsage(args);
    default:
      die(`Unknown resource: ${args.resource}`);
  }
}

main();
