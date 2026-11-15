import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { SignJWT, generateKeyPair } from 'jose';

const {
  verifyAccessToken,
  findActiveUser,
  invalidateUserCache,
  clearUserCache,
  getUserCacheSize,
} = await import('../dist/middleware/auth.js');

// Tài khoản admin dùng để thử: đặt trong backend/.env, không ghi vào repo.
const ADMIN_AUTH_ID = process.env.TEST_ADMIN_AUTH_ID;
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

const missingEnv = !TEST_EMAIL || !TEST_PASSWORD || !ADMIN_AUTH_ID;

test('Auth JWT & Profile Cache (CT-04 / E1)', { skip: missingEnv && 'Thiếu TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD hoặc TEST_ADMIN_AUTH_ID' }, async (t) => {
  // Clear any existing cache
  clearUserCache();
  assert.equal(getUserCacheSize(), 0);

  // 1. Obtain a valid real Supabase token
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  assert.ifError(authError);
  const validToken = authData.session.access_token;
  assert.ok(validToken);

  await t.test('1. verifyAccessToken succeeds on valid Supabase token via local JWKS', async () => {
    const t0 = performance.now();
    const authUserId = await verifyAccessToken(validToken);
    const dur1 = performance.now() - t0;
    assert.equal(authUserId, ADMIN_AUTH_ID);

    // Second call should use cached JWKS and be sub-millisecond
    const t1 = performance.now();
    const authUserId2 = await verifyAccessToken(validToken);
    const dur2 = performance.now() - t1;
    assert.equal(authUserId2, ADMIN_AUTH_ID);
    console.log(`  Local JWKS verify duration: 1st=${dur1.toFixed(2)}ms, 2nd=${dur2.toFixed(2)}ms`);
    assert.ok(dur2 < 10, 'Cached verification should be fast (< 10ms)');
  });

  await t.test('2. verifyAccessToken rejects malformed or invalid token with 401 INVALID_TOKEN', async () => {
    await assert.rejects(
      async () => {
        await verifyAccessToken('invalid.token.payload');
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.code, 'INVALID_TOKEN');
        return true;
      }
    );
  });

  await t.test('3. verifyAccessToken rejects expired token with 401 INVALID_TOKEN', async () => {
    // Generate a synthetic expired token signed by an untrusted key
    const { privateKey } = await generateKeyPair('ES256');
    const expiredToken = await new SignJWT({ sub: ADMIN_AUTH_ID })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuer(`${process.env.SUPABASE_URL}/auth/v1`)
      .setAudience('authenticated')
      .setExpirationTime('1s') // expired in the past
      .sign(privateKey);

    await assert.rejects(
      async () => {
        await verifyAccessToken(expiredToken);
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.code, 'INVALID_TOKEN');
        return true;
      }
    );
  });

  await t.test('4. findActiveUser caches profile in memory (TTL 60s)', async () => {
    clearUserCache();
    assert.equal(getUserCacheSize(), 0);

    // First call queries DB
    const t0 = performance.now();
    const user1 = await findActiveUser(ADMIN_AUTH_ID);
    const durDb = performance.now() - t0;
    assert.equal(user1.auth_user_id, ADMIN_AUTH_ID);
    assert.equal(user1.role, 'ADMIN');
    assert.equal(getUserCacheSize(), 1);

    // Second call hits RAM cache
    const t1 = performance.now();
    const user2 = await findActiveUser(ADMIN_AUTH_ID);
    const durCache = performance.now() - t1;
    assert.strictEqual(user1, user2); // Same object reference from cache
    console.log(`  Profile fetch duration: DB=${durDb.toFixed(2)}ms, Cache=${durCache.toFixed(3)}ms`);
    assert.ok(durCache < 1, 'In-memory cache fetch should be < 1ms');
  });

  await t.test('5. invalidateUserCache removes profile from RAM', async () => {
    assert.equal(getUserCacheSize(), 1);
    invalidateUserCache(ADMIN_AUTH_ID);
    assert.equal(getUserCacheSize(), 0);

    // Calling findActiveUser again reloads from DB
    const userReloaded = await findActiveUser(ADMIN_AUTH_ID);
    assert.equal(userReloaded.auth_user_id, ADMIN_AUTH_ID);
    assert.equal(getUserCacheSize(), 1);
  });

  await t.test('6. clearUserCache purges all cached entries', async () => {
    assert.ok(getUserCacheSize() >= 1);
    clearUserCache();
    assert.equal(getUserCacheSize(), 0);
  });
});
