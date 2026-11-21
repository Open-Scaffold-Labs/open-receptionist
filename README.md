# Open Receptionist demo (`@openscaffold/receptionist-demo`)

> **Demo only.** This repo is a front-desk demo console with fictional data. It does not answer
> calls, place calls, or send texts, and it is **not** a shipped Open Scaffold Labs module.
> `api/agent/mcp.js` returns a static tool catalog only.

This package used to call itself `@openscaffold/voice` 1.0.0, which collided with the real voice
module. It has been renamed and marked `private: true` so it can never be published under the
module name.

## Where the real modules live

The canonical modules live in the private repo
[`Open-Scaffold-Labs/openscaffold-voice`](https://github.com/Open-Scaffold-Labs/openscaffold-voice):

| Package | Path | What it is |
| --- | --- | --- |
| `@openscaffold/voice` | `packages/voice` | Staff voice copilot, capture and speech-to-text adapters (0.2.0, extracted from OpenRestaurant) |
| `@openscaffold/receptionist` | `packages/receptionist` | Open Voice Receptionist core: inbound answer/route/message/book, outbound confirmations, staff handoff, per-tenant config (in review) |

Build receptionist features there, not here.

Hosted demo: `https://open-receptionist-os.vercel.app` (fictional data).

## Development

```bash
npm install
npm test
npm start   # http://localhost:3000
```

## DEV-AUTH-01

Phase 1 gap: this review app has no email magic-link or OTP sign-in and no `team_reviewer` demo tenant. `lib/teamAllowlist.mjs` holds the dev/review allowlist helper (including `osl-devauth-test@agentmail.to`) but stays off unless `OSL_DEV_AUTH_ENABLED=1`. That flag must not be set on a live production host. See `docs/security-decisions.md`.
