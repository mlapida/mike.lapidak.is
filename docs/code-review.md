# Pull request reviews and checks

## Native Codex review

The repository uses `AGENTS.md` for Codex review guidance. Claude's review
and `@claude` workflows have been removed. Native review is configured
outside GitHub Actions and needs owner activation:

1. Confirm `mlapida/mike.lapidak.is` is connected to Codex through the OpenAI
   GitHub app. Repository access alone does not establish that review is on.
2. With GitHub push or admin permission, open
   [Codex code review settings](https://chatgpt.com/settings/code-review),
   select this repository, and enable **Automatic review** under **Review code**.
3. Check **Automatic review** under **Personal preferences** and select the
   desired **Review trigger**.
4. Verify a representative PR receives a Codex review. For a manual check,
   comment `@codex review` and confirm the bot reacts and posts a review.

For PR assistance, comment a specific request such as
`@codex fix the CI failures`. Native PR assistance replaces the PR-comment
use case; there is no replacement issue-event workflow in this repository.

Status: repository configuration is ready for native review. Account settings
and a successful native review have not been verified by this migration.
See the [official GitHub integration guide](https://learn.chatgpt.com/docs/third-party/github).

## Build and test checks

`.github/workflows/ci.yml` runs `npm ci` and `npm run test:ci` on Node 24 for
PRs targeting `main`, pushes to `main`, and manual dispatch. The check name
is **Build and test**. A fresh build precedes Vitest because output tests
read `dist/`. Public R2 photo originals must be reachable during the build.

The existing **Cloudflare Pages** check and automatic branch previews remain
managed by Cloudflare's Git integration. This workflow does not deploy.

No OpenAI API key, Anthropic credential, or custom Codex GitHub Action is
needed by this configuration. Existing account credentials are not edited
or deleted. Branch protections and required-check settings are unchanged;
AI review findings and passing build/tests are separate evidence.
