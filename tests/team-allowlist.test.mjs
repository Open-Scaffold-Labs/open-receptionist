import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  DEV_REVIEW_TEAM_EMAILS,
  parseTeamEmails,
  resolveTeamEmails,
  teamAuthEnabled,
  isTeamEmail,
} from '../lib/teamAllowlist.mjs';

const serverSource = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

test('DEV-AUTH-01 Phase 1 gap: the server has no email OTP or magic-link route', () => {
  assert.equal(serverSource.includes('signInWithOtp'), false);
  assert.equal(/\/api\/auth\/team-otp|magic-link|magicLink/.test(serverSource), false);
  assert.equal(serverSource.includes('OSL_TEAM_EMAILS'), false);
  assert.equal(serverSource.includes('team_reviewer'), false);
});

test('parseTeamEmails trims, lowercases, and de-duplicates', () => {
  assert.deepEqual(
    parseTeamEmails('  osl-devauth-test@agentmail.to, Dale@OpenScaffoldLabs.com, osl-devauth-test@agentmail.to '),
    ['osl-devauth-test@agentmail.to', 'dale@openscaffoldlabs.com'],
  );
  assert.deepEqual(parseTeamEmails(''), []);
  assert.deepEqual(parseTeamEmails(undefined), []);
});

test('the path stays off by default, including when emails are listed without the enable flag', () => {
  const env = { OSL_TEAM_EMAILS: 'osl-devauth-test@agentmail.to' };
  assert.equal(teamAuthEnabled(env), false);
  assert.deepEqual(resolveTeamEmails(env), []);
  assert.equal(isTeamEmail('osl-devauth-test@agentmail.to', env), false);
  assert.equal(teamAuthEnabled({}), false);
  assert.equal(teamAuthEnabled({ OSL_DEV_AUTH_ENABLED: 'true' }), false);
  assert.equal(teamAuthEnabled({ OSL_DEV_AUTH_ENABLED: '0' }), false);
});

test('when explicitly enabled with no OSL_TEAM_EMAILS, the committed dev/review list includes the test inbox', () => {
  const env = { OSL_DEV_AUTH_ENABLED: '1' };
  assert.equal(teamAuthEnabled(env), true);
  assert.ok(DEV_REVIEW_TEAM_EMAILS.includes('osl-devauth-test@agentmail.to'));
  assert.deepEqual(resolveTeamEmails(env), [...DEV_REVIEW_TEAM_EMAILS]);
  assert.equal(isTeamEmail('osl-devauth-test@agentmail.to', env), true);
  assert.equal(isTeamEmail('nobody@example.com', env), false);
});

test('OSL_TEAM_EMAILS replaces the default list when the path is enabled; it does not apply in production by default', () => {
  const env = { OSL_DEV_AUTH_ENABLED: '1', OSL_TEAM_EMAILS: 'reviewer@openscaffoldlabs.com' };
  assert.deepEqual(resolveTeamEmails(env), ['reviewer@openscaffoldlabs.com']);
  assert.equal(isTeamEmail('osl-devauth-test@agentmail.to', env), false);
  assert.equal(isTeamEmail('reviewer@openscaffoldlabs.com', env), true);
});
