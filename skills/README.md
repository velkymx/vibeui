# VibeUI agent skills

Portable [Agent Skills](https://agentskills.io) for building UI with VibeUI. One `SKILL.md` works in Claude Code, OpenAI Codex, and other agents that follow the open format.

## Layout

```
skills/vibeui/
├── SKILL.md              # triggering metadata + workflow + rules
├── agents/openai.yaml    # optional Codex/ChatGPT UI metadata
└── references/
    ├── component-map.md  # inventory with doc paths and key props
    ├── patterns.md       # app shell, auth, form, table, dialog, states
    ├── design-review.md  # budgets, slop tells, ship gate
    └── troubleshooting.md
```

The repo also exposes the same folder through two symlinks:

- `.claude/skills/vibeui` → `skills/vibeui` (Claude Code)
- `.agents/skills/vibeui` → `skills/vibeui` (OpenAI Codex scans `.agents/skills` from the working directory up to the repo root)

Edit the canonical folder. Do not copy the files into the symlink targets.

## Install in another project

The skill ships in the npm package (`skills/`). Copy it into the location your agent scans:

```bash
# Claude Code
mkdir -p .claude/skills
cp -R node_modules/@velkymx/vibeui/skills/vibeui .claude/skills/

# OpenAI Codex (project-level)
mkdir -p .agents/skills
cp -R node_modules/@velkymx/vibeui/skills/vibeui .agents/skills/
```

For user-level installs, use `~/.claude/skills/` or `~/.agents/skills/`. For the ChatGPT desktop app or Claude.ai, import or upload the `skills/vibeui` folder through that product's Skills UI.

## Using it

Once installed, the agent loads the skill when a task matches its description (VibeUI pages, forms, tables, modals, UI review, anti-slop work). You can also invoke it explicitly:

- Claude Code: `/vibeui`
- Codex: `$vibeui`

The skill points the agent at the installed docs (`node_modules/@velkymx/vibeui/llms.txt` and `docs/`) before it writes code, and at `docs/unslop.md` (when present) for the full design review.

## Editing

- Keep `SKILL.md` under ~500 lines; push detail into `references/`.
- Frontmatter needs `name` and `description`; the description is the trigger.
- Validate after edits: `name` is lowercase and matches the folder, `description` says what the skill does and when to use it, and every reference path exists.
- Re-read the component docs when the library changes; the skill must not drift from the documented API.
