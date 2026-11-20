import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
process.env.FRONTEND_ORIGIN='http://localhost:3000';
process.env.AUTH_EMAIL_REDIRECT_URL='http://localhost:3000/login';
process.env.SUPABASE_URL='https://example.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY='test-key';
process.env.DATABASE_URL='postgresql://test:test@localhost:5432/test';
const {app}=await import('../dist/app.js');
test('Supabase client initializes on the supported Node runtime', async()=>{
 const {createAuthClient}=await import('../dist/lib/supabase.js');
 const client=createAuthClient();
 assert.equal(typeof client.auth.signInWithPassword,'function');
});
test('Auth rejects invalid requests before contacting Supabase', async()=>{
 const server=app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}/api/auth`;
 try {
  let r=await fetch(base+'/refresh',{method:'POST',headers:{Origin:'https://untrusted.example'}});
  assert.equal(r.status,403);
  r=await fetch(base+'/register',{method:'POST',headers:{Origin:process.env.FRONTEND_ORIGIN,'Content-Type':'application/json'},body:JSON.stringify({email:'person@example.com',password:'password123',fullName:'Test User',role:'ADMIN'})});
  assert.equal(r.status,400);
  r=await fetch(base+'/me'); assert.equal(r.status,401);
  r=await fetch(base+'/google/callback?code=synthetic',{redirect:'manual'});
  assert.equal(r.status,303);
  assert.match(r.headers.get('location'),/auth_error=invalid_oauth_callback/);
  assert.equal(r.headers.get('referrer-policy'),'no-referrer');
  r=await fetch(base+'/google',{method:'POST',headers:{Origin:process.env.FRONTEND_ORIGIN}});
  assert.equal(r.status,200);
  const oauth=await r.json();
  const oauthUrl=new URL(oauth.url);
  assert.equal(oauthUrl.searchParams.get('provider'),'google');
  assert.ok(oauthUrl.searchParams.get('code_challenge'));
  assert.match(r.headers.get('set-cookie'),/ielts_google_pkce=/);
  assert.match(r.headers.get('set-cookie'),/HttpOnly/);
  assert.match(r.headers.get('set-cookie'),/SameSite=Lax/);
  r=await fetch(base+'/forgot-password',{method:'POST',headers:{Origin:process.env.FRONTEND_ORIGIN,'Content-Type':'application/json'},body:JSON.stringify({email:'invalid'})});assert.equal(r.status,400);
  r=await fetch(base+'/reset-password',{method:'POST',headers:{Origin:process.env.FRONTEND_ORIGIN,'Content-Type':'application/json'},body:JSON.stringify({password:'password123'})});assert.equal(r.status,400);
  r=await fetch(base+'/refresh',{method:'POST',headers:{Origin:process.env.FRONTEND_ORIGIN}});assert.equal(r.status,401);
  r=await fetch(base+'/logout',{method:'POST',headers:{Origin:process.env.FRONTEND_ORIGIN}});assert.equal(r.status,204);
  assert.match(r.headers.get('set-cookie'),/HttpOnly/i);
  assert.equal(r.headers.get('cache-control'),'no-store');
 } finally {await new Promise(resolve=>server.close(resolve));}
});

test('Verification resend uses the signup flow and reports throttling', async t => {
 const nativeFetch = globalThis.fetch;
 let providerCode;
 let providerCalls = 0;
 t.mock.method(globalThis, 'fetch', async (input, options) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (url.hostname !== 'example.supabase.co') return nativeFetch(input, options);
  const body = JSON.parse(options.body);
  assert.equal(body.email, 'verify@example.test');
  if (url.pathname === '/auth/v1/token') {
   return Response.json({ code: 'email_not_confirmed', msg: 'Email not confirmed' },
    { status: 400, headers: { 'X-Supabase-Api-Version': '2024-01-01' } });
  }
  providerCalls++;
  assert.equal(url.pathname, '/auth/v1/resend');
  assert.equal(url.searchParams.get('redirect_to'), process.env.AUTH_EMAIL_REDIRECT_URL);
  assert.equal(body.type, 'signup');
  if (!providerCode) return Response.json({});
  const status = providerCode === 'over_email_send_rate_limit' ? 429
   : providerCode === 'unexpected_failure' ? 500 : 400;
  return Response.json({ code: providerCode, msg: 'Mock provider failure' },
   { status, headers: { 'X-Supabase-Api-Version': '2024-01-01' } });
 });
 const server = app.listen(0, '127.0.0.1');
 await new Promise(resolve => server.once('listening', resolve));
 const base = `http://127.0.0.1:${server.address().port}/api/auth`;
 const post = (path, body, origin = process.env.FRONTEND_ORIGIN) => nativeFetch(base + path, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
 });
 try {
  const email = { email: 'Verify@Example.Test ' };
  const signup = '/resend-verification';
  assert.equal((await post(signup, email, 'https://untrusted.test')).status, 403);
  assert.equal((await post(signup, { email: 'invalid' })).status, 400);
  assert.equal(providerCalls, 0);
  const login = await post('/login', { ...email, password: 'test-password' });
  assert.equal(login.status, 403);
  assert.equal((await login.json()).code, 'EMAIL_NOT_VERIFIED');
  const accepted = await post(signup, email);
  assert.equal(accepted.status, 202);
  const message = await accepted.json();
  providerCode = 'user_not_found';
  assert.deepEqual(await (await post(signup, email)).json(), message);
  providerCode = 'over_email_send_rate_limit';
  assert.equal((await post(signup, email)).status, 429);
  providerCode = 'unexpected_failure';
  assert.equal((await post(signup, email)).status, 503);
  assert.equal((await post(signup, email)).status, 429);
  assert.equal(providerCalls, 4);
 } finally {
  await new Promise(resolve => server.close(resolve));
 }
});
