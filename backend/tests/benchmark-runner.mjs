import { createClient } from '@supabase/supabase-js';
import { app } from '../dist/app.js';
import { prisma } from '../dist/lib/prisma.js';
import { createExamSet, deleteExamSet } from '../dist/modules/exams/exam-sets.service.js';
import { addTest } from '../dist/modules/exams/exam-tests.service.js';
import { createSkill } from '../dist/modules/exams/exam-skills.service.js';
import { getEditorSkill, saveSkillContent, deleteSkill } from '../dist/modules/exams/exam-editor.service.js';

// Tài khoản admin dùng để thử: đặt trong backend/.env, không ghi vào repo.
const ADMIN_AUTH_ID = process.env.TEST_ADMIN_AUTH_ID;
const ADMIN_USER_ID = process.env.TEST_ADMIN_USER_ID;
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function p95(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.max(0, idx)];
}

function parseServerTiming(header) {
  if (!header) return {};
  const result = {};
  const parts = header.split(',');
  for (const part of parts) {
    const match = part.trim().match(/^([^;]+);dur=([\d.]+)(?:;desc="([^"]*)")?/);
    if (match) {
      result[match[1]] = { dur: parseFloat(match[2]), desc: match[3] };
    }
  }
  return result;
}

async function getAccessToken() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (error || !data?.session?.access_token) {
    throw new Error('Could not get access token: ' + (error?.message || 'unknown'));
  }
  return data.session.access_token;
}

async function run() {
  if (!TEST_EMAIL || !TEST_PASSWORD || !ADMIN_AUTH_ID || !ADMIN_USER_ID) {
    throw new Error('Đặt TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_ADMIN_AUTH_ID, TEST_ADMIN_USER_ID trong backend/.env trước khi chạy benchmark.');
  }
  console.log('--- STARTING BENCHMARK RUN ---');
  const token = await getAccessToken();
  console.log('Authenticated as Admin');

  // Start server on ephemeral port
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/admin`;
  console.log(`Server listening on ${baseUrl}`);

  const results = {};

  try {
    // Setup test exam set and skills for benchmark
    const benchSetName = `Bench Set ${Date.now()}`;
    const testSet = await createExamSet({ name: benchSetName, newCategoryName: 'Benchmark' }, ADMIN_USER_ID);
    const updatedSet = await addTest(testSet.id, 'Bench Test 1', ADMIN_USER_ID);
    const testId = updatedSet.tests[0].id;

    // Create a Writing Academic skill
    const setWithWriting = await createSkill(testId, 'WRITING', 'ACADEMIC', ADMIN_USER_ID);
    let writingDraftId = setWithWriting.tests[0].slots.WRITING_ACADEMIC.draftId;

    // Setup initial Writing content
    const initialWriting = await getEditorSkill(writingDraftId);
    let savedWriting = await saveSkillContent(
      writingDraftId,
      {
        baseUpdatedAt: initialWriting.updatedAt,
        writing: {
          tasks: [
            { prompt: 'Task 1 benchmark prompt', imagePath: `exam-skills/${writingDraftId}/test-chart.png` },
            { prompt: 'Task 2 benchmark prompt', imagePath: null },
          ],
        },
      },
      ADMIN_USER_ID
    );

    // Create a published skill for publishing / drafting benchmarks
    const setWithSpeaking = await createSkill(testId, 'SPEAKING', null, ADMIN_USER_ID);
    let speakingDraftId = setWithSpeaking.tests[0].slots.SPEAKING.draftId;
    const initialSpeaking = await getEditorSkill(speakingDraftId);
    await saveSkillContent(
      speakingDraftId,
      {
        baseUpdatedAt: initialSpeaking.updatedAt,
        speaking: {
          p13Minutes: 12,
          part1: {
            instruction: 'Answer the questions.',
            questions: ['Where are you from?'],
          },
          part2: {
            prepMinutes: 1,
            speakMinutes: 2,
            cueCard: 'Describe a person you admire.',
          },
          part3: {
            instruction: 'Discuss related topics.',
            questions: ['Why do people admire celebrities?'],
          },
        },
      },
      ADMIN_USER_ID
    );

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    };

    async function benchmarkOp(name, fn, iterations = 10) {
      console.log(`\nBenchmarking: ${name} (${iterations} iterations)...`);
      const durations = [];
      const authTimes = [];
      const dbTimes = [];
      const queryCounts = [];

      for (let i = 0; i < iterations; i++) {
        const t0 = performance.now();
        const res = await fn(i);
        const t1 = performance.now();
        const dur = t1 - t0;
        durations.push(dur);

        const timing = parseServerTiming(res.headers.get('server-timing'));
        if (timing.auth) authTimes.push(timing.auth.dur);
        if (timing.db) {
          dbTimes.push(timing.db.dur);
          if (timing.db.desc) {
            const m = timing.db.desc.match(/(\d+)\s+queries/);
            if (m) queryCounts.push(parseInt(m[1], 10));
          }
        }
        process.stdout.write(` ${Math.round(dur)}ms`);
      }
      console.log('');

      const resObj = {
        iterations,
        median: Math.round(median(durations) * 10) / 10,
        p95: Math.round(p95(durations) * 10) / 10,
        min: Math.round(Math.min(...durations) * 10) / 10,
        max: Math.round(Math.max(...durations) * 10) / 10,
        authMedian: authTimes.length ? Math.round(median(authTimes) * 10) / 10 : null,
        dbMedian: dbTimes.length ? Math.round(median(dbTimes) * 10) / 10 : null,
        queriesMedian: queryCounts.length ? Math.round(median(queryCounts)) : null,
      };
      results[name] = resObj;
      console.log(`  -> Median: ${resObj.median}ms | p95: ${resObj.p95}ms | Auth: ${resObj.authMedian}ms | DB: ${resObj.dbMedian}ms | Queries: ${resObj.queriesMedian}`);
      return resObj;
    }

    // 1. GET danh sách bộ đề
    await benchmarkOp('1. GET /exam-sets', async () => {
      const r = await fetch(`${baseUrl}/exam-sets`, { headers });
      if (!r.ok) throw new Error(`Status ${r.status}: ${await r.text()}`);
      return r;
    });

    // 2. GET bộ đề (chi tiết 1 bộ + 4 bài thi)
    await benchmarkOp('2. GET /exam-sets/:id', async () => {
      const r = await fetch(`${baseUrl}/exam-sets/${testSet.id}`, { headers });
      if (!r.ok) throw new Error(`Status ${r.status}: ${await r.text()}`);
      return r;
    });

    // 3. GET kỹ năng (chi tiết 1 bài thi để edit)
    await benchmarkOp('3. GET /exam-skills/:id', async () => {
      const r = await fetch(`${baseUrl}/exam-skills/${writingDraftId}`, { headers });
      if (!r.ok) throw new Error(`Status ${r.status}: ${await r.text()}`);
      return r;
    });

    // 4. PUT lưu Writing 2 Task
    let currentUpdated = savedWriting.updatedAt;
    await benchmarkOp('4. PUT /exam-skills/:id/content (Writing 2 Task)', async (i) => {
      const r = await fetch(`${baseUrl}/exam-skills/${writingDraftId}/content`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          baseUpdatedAt: currentUpdated,
          writing: {
            tasks: [
              { prompt: `Task 1 prompt updated iteration ${i}`, imagePath: `exam-skills/${writingDraftId}/test-chart.png` },
              { prompt: `Task 2 prompt updated iteration ${i}`, imagePath: null },
            ],
          },
        }),
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${await r.text()}`);
      const data = await r.json();
      currentUpdated = data.updatedAt;
      return r;
    });

    // Publish speaking draft so we can benchmark creating draft and publishing
    const pubRes = await fetch(`${baseUrl}/exam-skills/${speakingDraftId}/publish`, {
      method: 'POST',
      headers,
    });
    if (!pubRes.ok) throw new Error(`Publish failed: ${await pubRes.text()}`);

    // 5. POST tạo bản sửa (Speaking/Writing)
    let lastDraftId = null;
    await benchmarkOp('5. POST /exam-skills/:id/draft', async (i) => {
      if (lastDraftId) {
        await deleteSkill(lastDraftId, ADMIN_USER_ID);
        lastDraftId = null;
      }
      const r = await fetch(`${baseUrl}/exam-skills/${speakingDraftId}/draft`, {
        method: 'POST',
        headers,
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${await r.text()}`);
      const data = await r.clone().json();
      lastDraftId = data.id;
      return r;
    });

    // 6. POST đăng kỹ năng (publish)
    // To measure publish 10 times, we set status to DRAFT then call publish
    await benchmarkOp('6. POST /exam-skills/:id/publish', async (i) => {
      // Set status back to DRAFT in DB so publish endpoint can publish it
      await prisma.exam_skills.update({
        where: { id: writingDraftId },
        data: { status: 'DRAFT', published_at: null },
      });
      const r = await fetch(`${baseUrl}/exam-skills/${writingDraftId}/publish`, {
        method: 'POST',
        headers,
      });
      if (!r.ok) throw new Error(`Status ${r.status}: ${await r.text()}`);
      return r;
    });

    // Cleanup test set
    console.log('\nCleaning up benchmark exam set...');
    if (lastDraftId) {
      try { await deleteSkill(lastDraftId, ADMIN_USER_ID); } catch {}
    }
    await deleteExamSet(testSet.id, ADMIN_USER_ID);
    console.log('Cleanup complete.');

    console.log('\n================ BENCHMARK SUMMARY ================');
    console.table(results);
    console.log('===================================================\n');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  }
}

run().catch((err) => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
