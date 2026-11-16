/**
 * DEV-AUTH-01 team allowlist helper for dev/review only.
 * There is no email magic-link or OTP path in this app yet (Phase 1 gap).
 * This module is not mounted on any route. It stays off unless
 * OSL_DEV_AUTH_ENABLED is exactly "1". It is not a production allowlist.
 */

export const DEV_REVIEW_TEAM_EMAILS = Object.freeze([
  'osl-devauth-test@agentmail.to',
  'dale@openscaffoldlabs.com',
  'daleraaen@gmail.com',
]);

export function parseTeamEmails(raw) {
  if (!raw) return [];
  const seen = new Set();
  const emails = [];
  for (const part of String(raw).split(',')) {
    const email = part.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }
  return emails;
}

export function resolveTeamEmails(env = process.env) {
  if (env.OSL_DEV_AUTH_ENABLED !== '1') return [];
  const fromEnv = parseTeamEmails(env.OSL_TEAM_EMAILS);
  return fromEnv.length ? fromEnv : [...DEV_REVIEW_TEAM_EMAILS];
}

export function teamAuthEnabled(env = process.env) {
  return env.OSL_DEV_AUTH_ENABLED === '1' && resolveTeamEmails(env).length > 0;
}

export function isTeamEmail(email, env = process.env) {
  if (!teamAuthEnabled(env)) return false;
  return resolveTeamEmails(env).includes(String(email).trim().toLowerCase());
}
