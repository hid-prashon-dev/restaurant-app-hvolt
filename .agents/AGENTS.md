
# Himavolt Documentation Rule

From now on, every implementation change must include documentation updates.
Do not consider any phase, patch, bug fix, refactor, schema change, route change, auth change, UI change, or architecture change complete unless the relevant documentation is updated.

Required docs to consider after every change:
* docs/PROJECT_HANDOFF.md`n* docs/PHASE_LOG.md`n* docs/NEXT_AI_PROMPT.md`n* Any phase-specific or module-specific documentation if created later
* Main architecture Markdown if the system architecture changes

Rules:
1. If files are created, modified, deleted, or behavior changes, update the docs.
2. If a bug is fixed, add it to docs/PHASE_LOG.md.
3. If architecture or security rules change, update docs/PROJECT_HANDOFF.md.
4. If the next AI continuation instructions change, update docs/NEXT_AI_PROMPT.md.
5. If no documentation update is needed, explicitly explain why.
6. Do not silently skip documentation.
7. Documentation updates should be part of the same commit as the implementation change whenever possible.

Every implementation report must include:
1. Files created
2. Files modified
3. Behavior changed
4. Docs updated
5. Docs not updated, with reason if applicable
6. Suggested git commit message

**Remember: update docs/* with every meaningful project change. No change is complete without documentation.**

