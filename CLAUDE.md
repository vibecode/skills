# vibecode/skills

This is the vibecode skills repository (`github.com/vibecode/skills`). It contains all skills published by vibecode for Claude.

## Repository Structure

```
skills/
├── .claude-plugin/
│   └── marketplace.json   # Plugin marketplace config for vibecode-skills
├── skills/                # All vibecode-published skills live here
├── spec/
│   └── agent-skills-spec.md
├── template/
│   └── SKILL.md           # Boilerplate for creating new skills
├── .gitignore
└── README.md
```

## How Skills Work

Each skill is a self-contained folder inside `skills/` with a `SKILL.md` file. The `SKILL.md` uses YAML frontmatter for metadata and markdown for instructions:

```markdown
---
name: my-skill-name
description: What the skill does and when to use it
---

# Instructions, examples, and guidelines
```

## Adding a New Skill

1. Create a new folder under `skills/` (e.g. `skills/my-new-skill/`)
2. Add a `SKILL.md` using the template in `template/SKILL.md`
3. Register the skill in `.claude-plugin/marketplace.json` by adding it to the appropriate plugin's `skills` array
4. Update the README if needed

## Marketplace Registration

The `.claude-plugin/marketplace.json` defines plugin sets that users install via Claude Code:

```
/plugin marketplace add vibecode/skills
/plugin install <plugin-name>@vibecode-skills
```

When adding skills to `marketplace.json`, group related skills into a plugin entry with a `name`, `description`, and `skills` array of paths.
