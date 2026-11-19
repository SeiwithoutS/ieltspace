import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { env } from '../dist/config.js';
import { r2Bucket, r2Configured, recordingsBucket, R2StorageError } from '../dist/integrations/storage/r2-storage.js';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf2kAAAAASUVORK5CYII=', 'base64');

// 10 milliseconds of mono silence with a valid PCM WAV header.
const wav = Buffer.alloc(204);
wav.write('RIFF');
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(8000, 24);
wav.writeUInt32LE(16000, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(wav.length - 44, 40);

async function check(label, bucket, suffix, contentType, fixture) {
  const key = `_storage-check/${randomUUID()}.${suffix}`;
  try {
    await bucket.put(key, fixture, contentType);
    const signed = await bucket.signedReadUrl(key, 60);
    const unsigned = new URL(signed);
    unsigned.search = '';
    const direct = await fetch(unsigned, { signal: AbortSignal.timeout(10_000), redirect: 'error' });
    await direct.body?.cancel();
    assert.ok([400, 401, 403, 404].includes(direct.status), 'Unsigned read was not denied');
    const read = await fetch(signed, { signal: AbortSignal.timeout(10_000), redirect: 'error' });
    assert.equal(read.status, 200, 'Signed read failed');
    assert.equal(read.headers.get('content-type'), contentType);
    assert.ok(fixture.equals(Buffer.from(await read.arrayBuffer())), 'Object contents differ');
  } finally {
    await bucket.remove(key);
  }
  const afterDeletion = await fetch(await bucket.signedReadUrl(key, 60), { signal: AbortSignal.timeout(10_000), redirect: 'error' });
  await afterDeletion.body?.cancel();
  assert.equal(afterDeletion.status, 404, 'Temporary object was not removed');
  console.log(`${label}: upload, private read, signed download and cleanup passed`);
}

if (!r2Configured || !process.argv.includes('--write-temporary-objects')) {
  console.error('Configure R2 credentials and pass --write-temporary-objects to verify the configured buckets.');
  process.exitCode = 1;
} else {
  for (const args of [
    ['avatars', r2Bucket(env.R2_AVATAR_BUCKET), 'png', 'image/png', png],
    ['recordings', recordingsBucket, 'wav', 'audio/wav', wav],
  ]) {
    try {
      await check(...args);
    } catch (error) {
      const details = error instanceof R2StorageError ? error.message : error.code || error.cause?.code || error.name;
      console.error(`${args[0]}: ${details}`);
      process.exitCode = 1;
    }
  }
}
