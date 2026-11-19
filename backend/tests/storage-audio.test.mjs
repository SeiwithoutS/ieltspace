import test from 'node:test';
import assert from 'node:assert/strict';

const {
  detectAudioExtension,
} = await import('../dist/integrations/storage/supabase-storage.js');

test('detectAudioExtension: recognizes MP3 with ID3 header', () => {
  const mp3Id3 = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  assert.equal(detectAudioExtension(mp3Id3, 'audio/mpeg'), 'mp3');
  assert.equal(detectAudioExtension(mp3Id3, 'audio/mp3'), 'mp3');
});

test('detectAudioExtension: recognizes MP3 with MPEG frame sync', () => {
  const mp3Frame = Buffer.from([0xff, 0xfb, 0x90, 0x64, 0x00, 0x00]);
  assert.equal(detectAudioExtension(mp3Frame, 'audio/mpeg'), 'mp3');
});

test('detectAudioExtension: recognizes WAV with RIFF...WAVE', () => {
  const wavHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // size
    0x57, 0x41, 0x56, 0x45, // WAVE
  ]);
  assert.equal(detectAudioExtension(wavHeader, 'audio/wav'), 'wav');
  assert.equal(detectAudioExtension(wavHeader, 'audio/x-wav'), 'wav');
});

test('detectAudioExtension: recognizes M4A with ftyp', () => {
  const m4aHeader = Buffer.from([
    0x00, 0x00, 0x00, 0x20, // box size
    0x66, 0x74, 0x79, 0x70, // ftyp
    0x4d, 0x34, 0x41, 0x20, // M4A
  ]);
  assert.equal(detectAudioExtension(m4aHeader, 'audio/mp4'), 'm4a');
  assert.equal(detectAudioExtension(m4aHeader, 'audio/x-m4a'), 'm4a');
});

test('detectAudioExtension: rejects fake audio or mismatched format', () => {
  // PNG file disguised as mp3
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.throws(
    () => detectAudioExtension(pngHeader, 'audio/mpeg'),
    (err) => {
      assert.equal(err.status, 415);
      assert.equal(err.code, 'AUDIO_TYPE');
      return true;
    }
  );
});
