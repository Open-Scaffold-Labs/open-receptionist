# Security decisions

### DEV-AUTH-01 team allowlist helper, Phase 1 gap (2026-11-16)

- Decision: record the DEV-AUTH-01 Phase 1 gap and add a server-side `OSL_TEAM_EMAILS` helper for a later email magic-link or OTP path. This review app (Open Scaffold Voice, https://openscaffold-voice.vercel.app/) has no staff sign-in, no email OTP or magic-link route, and no `team_reviewer` seeded demo tenant. A one-click demo console is not a substitute for real authentication.
- The helper (`lib/teamAllowlist.mjs`) stays off unless `OSL_DEV_AUTH_ENABLED` is exactly `1`. Any other value, including unset, returns an empty list. This is not a production allowlist and is not mounted on any route in this PR.
- When the flag is on and `OSL_TEAM_EMAILS` is unset, the committed dev/review default is `osl-devauth-test@agentmail.to`, `dale@openscaffoldlabs.com`, and `daleraaen@gmail.com`. An explicit `OSL_TEAM_EMAILS` value replaces that default. Emails are trimmed and lowercased. The list is emails only, never passwords, and is not sent to the browser.
- Do not set `OSL_DEV_AUTH_ENABLED=1` on a live production host. This PR does not change Vercel env values. When a later PR adds the OTP path, enable the flag on the dev/review project only and provision allowlisted users as `team_reviewer` in a seeded demo tenant.
- No new write routes (so no new `zod .strict()` surface). No keys or secrets were added, rotated, or printed.
