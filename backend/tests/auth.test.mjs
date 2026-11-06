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
