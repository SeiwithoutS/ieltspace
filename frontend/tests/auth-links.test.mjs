import test from 'node:test';
import assert from 'node:assert/strict';
// Synthetic token only. No requests are sent to Supabase.
globalThis.location = { pathname: '/reset-password', hash: '#token_hash=synthetic&type=recovery' };
let replacement;
globalThis.history = { replaceState: (_state, _title, url) => { replacement = url; } };
const { parseAuthLink, takeRecoveryToken, emailCallback } = await import('../src/lib/auth-links.ts');
test('new recovery template opens reset and removes the secret fragment', () => {
 assert.equal(emailCallback.page, 'ResetPassword');
 assert.equal(replacement, '/reset-password#ResetPassword');
 assert.equal(takeRecoveryToken(), 'synthetic');
 assert.equal(takeRecoveryToken(), '');
});
test('legacy reset links remain supported', () => {
 assert.equal(parseAuthLink('/', '#ResetPassword?token_hash=legacy').token, 'legacy');
});
test('wrong token purpose is rejected and login navigation stays on login', () => {
 assert.equal(parseAuthLink('/reset-password', '#token_hash=test&type=signup').token, '');
 assert.equal(parseAuthLink('/reset-password', '#Login'), null);
});
test('confirmation failures are visible without reflecting untrusted descriptions', () => {
 const result = parseAuthLink('/login', '#error=access_denied&error_description=untrusted');
 assert.equal(result.page, 'Login');
 assert.ok(result.notice);
 assert.ok(!result.notice.includes('untrusted'));
});
