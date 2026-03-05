export type ParsedArgs = {
  resource: string;
  action: string;
  positional: string[];
  flags: Record<string, string>;
};
