## Release Workflow

1. Make changes.
2. (Optional) Generate a new change with 'pnpm changeset'.
3. (Optional) Increase version with 'pnpm changeset version' (depending on the changes made).
4. (Optional) 'pnpm install' to update the lockfile and rebuild packages.
5. Commit changes and push to the main branch.
6. Create a Github Release via the web UI or the GH CLI (uses the CI to publish, preferred) or run 'pnpm publish -r'.