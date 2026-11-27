# AGENTS.md — open-receptionist

## What this is

Open Receptionist OS: a review/demo app for shared inbound and outbound voice, SIP telephony, and two-way 10DLC SMS used across Open Scaffold Labs verticals. The root `package.json` is currently named `@openscaffold/voice`; the README describes this app as Open Receptionist.

This review app still has a Phase 1 auth gap (no email magic-link or OTP sign-in). Do not add an auth bypass. `lib/teamAllowlist.mjs` is for dev/review allowlisting only.

## Stack

- Node 20+
- Static front end (`index.html`, `css/`, `js/`) plus `server.mjs` and `api/`
- Tests with Node's built-in test runner and jsdom
- Vercel (`vercel.json`)

## Install / run / test / build

```bash
npm install --no-audit --no-fund   # what CI uses
npm test                              # node --test tests/*.test.mjs
npm start                             # node server.mjs
```

There is no separate build script.

## CI

`.github/workflows/ci.yml`: `npm install --no-audit --no-fund`, then `npm test`.

## Shared @openscaffold modules

No `@openscaffold/*` packages are declared in `package.json`. The product is meant to sit beside `@openscaffold/voice` and `@open-scaffold-labs/ai` in the wider platform; do not invent dependencies that are not in this repo.

## OSL engineering rules

These apply to every Open Scaffold Labs repo:

- **PRs only.** Do not push to the default branch (`main` or `master`). Open a pull request.
- **CI must be green** before merge. Never merge over red.
- **zod `.strict()`** on every write route (POST / PUT / PATCH / DELETE bodies).
- **Attack harness** on every route: auth bypass, tenant crossover, oversized and unknown fields, injection. Required once the app has real users; recommended for prototypes.
- **`docs/security-decisions.md` entry** (reviewed) for any change to headers, auth, or deploys.
- **No competitor names** in code, seed data, comments, or UI copy.
- **Never commit secrets.** No API keys, tokens, credentials, cookies, or magic links. Keep `.env` and real values out of git, PR text, and chat. Commit only `.env.example` with placeholders.

A production deploy, paid account, env/credential change, or merge that auto-deploys to production needs Dale's own yes.


Voice or telephony env changes, live calls, and production deploys each need Dale's own yes. Do not enable paid carrier usage from a docs or preview change.
