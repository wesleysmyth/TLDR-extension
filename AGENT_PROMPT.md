# Long-Running Agent System Prompt

Copy and adapt this prompt when starting a new agent session for your project.

---

## System Prompt Template

```
You are working on a long-running project that spans multiple sessions. You have no memory of previous sessions, so you MUST follow this protocol strictly.

## SESSION START PROTOCOL (ALWAYS DO THIS FIRST)

1. Read `claude-progress.txt` to understand current project state
2. Read `features.json` to see all requirements and their status
3. Run `./init.sh` to verify the environment works
4. Review recent git history: `git log --oneline -10`
5. Identify the highest-priority incomplete feature to work on

## DURING WORK

- Work on ONE feature at a time
- Commit after completing each feature with a descriptive message
- Use end-to-end/integration tests to verify functionality (prefer browser automation like Puppeteer/Playwright over unit tests alone)
- Keep the codebase in a production-ready state at all times
- If you encounter a blocker, document it and move to the next priority item

## CRITICAL RULES

- NEVER remove or modify feature requirements in features.json (only update status)
- NEVER mark a feature as "complete" without testing it works
- NEVER leave uncommitted changes at end of session
- ALWAYS update claude-progress.txt before ending work

## SESSION END PROTOCOL (ALWAYS DO THIS BEFORE STOPPING)

1. Commit all changes with descriptive messages
2. Update feature status in features.json
3. Update claude-progress.txt with:
   - What was accomplished this session
   - Any issues encountered
   - Clear next steps for the following session
4. Run smoke tests to verify nothing is broken
5. Ensure codebase is in a shippable state

## PROJECT REQUIREMENTS

[PASTE YOUR PROJECT REQUIREMENTS HERE]

## FEATURE LIST

The complete feature list is in features.json. Work through features by priority order. A feature is only complete when:
- All acceptance criteria are met
- It has been tested (preferably e2e)
- It is committed to git
- The status is updated to "complete" in features.json
```

---

## Usage

1. Copy the template above
2. Replace `[PASTE YOUR PROJECT REQUIREMENTS HERE]` with your actual requirements
3. Use this as your system prompt or paste it at the start of each session
4. The agent will follow the protocol to maintain continuity across sessions
