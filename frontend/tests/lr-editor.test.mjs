import test from 'node:test';
import assert from 'node:assert/strict';

import {
  blanks,
  cutBlank,
  parseAlt,
  limOf,
  overLimit,
  isNum,
  numberQuestions,
  allIssues,
  groupHasData,
} from '../src/lib/exams/lr-editor/pure.ts';

import {
  fromLrState,
  toLrState,
} from '../src/lib/exams/lr-editor/converters.ts';

import {
  diffLrContent,
  applySavedIds,
} from '../src/lib/exams/lr-editor/diff.ts';

import {
  groupOfType,
  comboOptions,
} from '../src/lib/exams/lr-editor/constants.ts';

const READING_FULL = {
  title: 'Practice Test 01',
  skill: 'READING',
  form: 'ACADEMIC',
  passages: [
    {
      orderNo: 1,
      title: 'The history of glass',
      paras: [
        'From our earliest origins, man has been making use of glass. Historians have discovered that a type of natural glass, obsidian, was formed in places such as the mouth of a volcano.',
        'Nobody knows exactly when glass was first made. Pliny, the Roman historian, suggested that sailors discovered it by accident when cooking on a beach.',
        'Glassmaking spread to Egypt and Mesopotamia, where beads and small vessels were produced. Around 30 BC the blowpipe was invented, which made glass cheaper.',
        'Under the Romans, glass objects were made across Europe. The knowledge spread to Venice, which became the centre of glassmaking for several centuries.',
        'In the 17th century, George Ravenscroft developed lead crystal, which was clearer and easier to cut than earlier glass.',
        'Today glass is made by machines in huge quantities, but the basic recipe of sand, soda and lime has changed little.',
        'Modern sheet glass is made by the float process. Sand, soda and lime are fed through a hopper into a furnace heated to 1,500°C. The molten glass then flows onto a bath of liquid tin, where it spreads out to form a perfectly flat sheet.',
      ],
      imgs: [],
      audio: null,
      groups: [
        {
          id: 'grp-r-1',
          type: 'SENTENCE_COMP',
          instr: null,
          items: [
            { text: 'Obsidian is a kind of glass that occurs in ___ .', ans: 'volcanoes', alt: 'volcano, volcanos' },
            { text: 'Pliny believed glass was first made by ___ .', ans: 'sailors', alt: null },
            { text: 'The invention of the ___ reduced the cost of glass.', ans: 'blowpipe', alt: null },
            { text: 'For centuries ___ was the main centre of glassmaking.', ans: 'Venice', alt: null },
            { text: 'Lead crystal was easier to ___ than older glass.', ans: 'cut', alt: null },
          ],
        },
        {
          id: 'grp-r-2',
          type: 'TABLE_COMP',
          instr: null,
          title: 'The development of glassmaking',
          rows: [
            ['Period', 'Place', 'Development'],
            ['Ancient world', '', ''],
            ['Before 30 BC', 'Egypt', 'beads and small ___'],
            ['30 BC', '___', 'blowpipe invented'],
            ['Modern times', '', ''],
            ['17th century', 'England', '___ crystal'],
            ['Today', 'worldwide', 'made by ___'],
          ],
          hd: [
            [true, true, true],
            [true, false, false],
            [true, false, false],
            [true, false, false],
            [true, false, false],
            [true, false, false],
            [true, false, false],
          ],
          sp: [
            [0, 0, 0],
            [[1, 3], 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [[1, 3], 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ],
          ans: ['vessels', 'Mesopotamia', 'lead', 'machines'],
        },
        {
          id: 'grp-r-3',
          type: 'DIAGRAM_COMP',
          instr: null,
          limit: 3,
          img: 'so-do-lo-nung-kinh.png',
          marks: [
            [7, 8, 16, 29.5],
            [42, 8, 40, 34],
            [56, 93, 66, 72],
            [96, 14, 93, 51.5],
          ],
          texts: [
            'Sand, soda and lime are fed through a ___',
            'The furnace is heated to ___ °C',
            'Molten glass floats on ___',
            'The glass leaves as a ___',
          ],
          ans: ['hopper', '1,500', 'liquid tin', 'flat sheet'],
          alt: [null, '1500', 'tin', null],
        },
      ],
    },
    {
      orderNo: 2,
      title: 'Sleep and memory',
      imgs: [{ name: 'bieu-do-ghi-nho.png', after: 0, caption: 'Figure 1' }],
      audio: null,
      paras: [
        'Scientists have long suspected that sleep plays a role in memory, but only recently have experiments shown how.',
        'In one study, volunteers learned a list of word pairs and were tested after either a night of sleep or a day awake.',
        'Those who slept remembered significantly more, especially pairs that had been hard to learn.',
        'Brain scans suggest that during deep sleep the hippocampus replays the day experiences.',
        'Short naps can also help, provided they include a period of slow-wave sleep.',
        'Researchers warn that screens before bed may reduce the quality of this kind of sleep.',
      ],
      groups: [
        {
          id: 'grp-r-4',
          type: 'MATCH_HEADING',
          instr: null,
          oneUse: true,
          hans: [0, 2, 3, 4, 5, 6],
          opts: [
            'An old idea finally tested',
            'Why naps are not enough',
            'A simple learning experiment',
            'The difficult cases benefit most',
            'What happens inside the brain',
            'Not all naps are equal',
            'A modern threat to sleep',
            'The cost of sleep problems',
          ],
          items: [],
        },
        {
          id: 'grp-r-5',
          type: 'MCQ_MULTI',
          instr: null,
          q: 'Which TWO factors improve memory according to the passage?',
          pick: 2,
          opts: [
            'deep sleep',
            'drinking coffee',
            'slow-wave naps',
            'using screens before bed',
            'learning in the morning',
          ],
          ans: [0, 2],
        },
        {
          id: 'grp-r-6',
          type: 'SUMMARY_BOX',
          instr: null,
          body: 'Volunteers who ___ after learning remembered more. The effect was strongest for ___ word pairs. During deep sleep the ___ replays memories. Naps work if they include ___ sleep, but ___ may harm it.',
          opts: [
            'slept',
            'easy',
            'difficult',
            'hippocampus',
            'slow-wave',
            'screens',
            'coffee',
            'light',
          ],
          ans: [0, 2, 3, 4, 5],
        },
      ],
    },
    {
      orderNo: 3,
      title: 'Who owns the city?',
      paras: [
        'Cities have always been shaped by competing interests: governments, developers and the people who live in them.',
        'Urban planner Jane Moss argues that residents should have the final say on new buildings.',
        'Economist Tom Reed disagrees, saying that markets allocate land more efficiently than committees.',
        'Architect Lin Wei believes good design can satisfy both sides if communities are consulted early.',
        'Historian Ana Diaz points out that the most loved neighbourhoods were rarely planned at all.',
      ],
      imgs: [],
      audio: null,
      groups: [
        {
          id: 'grp-r-7',
          type: 'MATCH_FEATURE',
          instr: null,
          oneUse: false,
          opts: ['Jane Moss', 'Tom Reed', 'Lin Wei', 'Ana Diaz', 'the writer'],
          items: [
            { text: 'Markets decide land use better than groups of officials.', ans: 1 },
            { text: 'Popular areas often grew without a plan.', ans: 3 },
            { text: 'Local people should decide on new buildings.', ans: 0 },
            { text: 'Early consultation leads to better design.', ans: 2 },
            { text: 'Cities reflect conflicting interests.', ans: 4 },
          ],
        },
        {
          id: 'grp-r-8',
          type: 'YNNG',
          instr: null,
          items: [
            { text: 'Developers have more influence than residents.', ans: 'NOT GIVEN' },
            { text: 'Planning committees are always slow.', ans: 'NOT GIVEN' },
            { text: 'Good design can serve several groups at once.', ans: 'YES' },
            { text: 'Most famous neighbourhoods were carefully planned.', ans: 'NO' },
            { text: 'Residents have no interest in how cities look.', ans: 'NO' },
          ],
        },
        {
          id: 'grp-r-9',
          type: 'MCQ_SINGLE',
          instr: null,
          items: [
            {
              q: "What is the writer's main purpose?",
              opts: ['to praise developers', 'to compare views on city planning', 'to criticise architects', 'to describe one city'],
              ans: 1,
            },
            {
              q: 'Tom Reed believes land should be allocated by',
              opts: ['residents', 'architects', 'the market', 'historians'],
              ans: 2,
            },
            {
              q: 'Lin Wei says communities should be consulted',
              opts: ['early', 'never', 'after building', 'only by experts'],
              ans: 0,
            },
            {
              q: 'Ana Diaz is described as',
              opts: ['an economist', 'a planner', 'an architect', 'a historian'],
              ans: 3,
            },
          ],
        },
      ],
    },
  ],
};

const LISTENING_FULL = {
  title: 'Practice Test 01',
  skill: 'LISTENING',
  form: null,
  passages: [
    {
      orderNo: 1,
      title: 'Booking a holiday cottage',
      audio: { name: 'section-1.mp3', path: 'exam-skills/s1/audio/sec1.mp3', sizeBytes: 5662310, durationSec: 348 },
      imgs: [],
      paras: [
        "[00:00] AGENT: Good morning, Lakeside Holiday Cottages. How can I help you?",
        "[00:06] SARAH: Hi, I'd like to book a cottage for the first week of July. My name's Sarah Mitchell, that's M-I-T-C-H-E-L-L.",
        '[00:21] AGENT: Thank you, Ms Mitchell. And how many people will be staying? SARAH: There are four of us, two adults and two children.',
      ],
      groups: [
        {
          id: 'grp-l-1',
          type: 'NOTE_COMP',
          instr: 'Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.',
          limit: 1,
          body: '## Lakeside Holiday Cottages · Booking form\nName: Sarah ___\nNumber of guests: ___\nCottage: ___ (near the lake)\nParking: space for ___ car\nDeposit: £___, paid by card\nHeard about us from: a ___',
          ans: ['Mitchell', '4', 'Willow', 'one', '150', 'magazine'],
          alt: [null, 'four', null, '1', null, null],
        },
        {
          id: 'grp-l-2',
          type: 'MCQ_SINGLE',
          instr: null,
          items: [
            { q: 'Guests may arrive at 2 pm if', opts: ['they phone in advance', 'the cleaners have finished', 'they pay extra'], ans: 1 },
            { q: 'What must guests bring?', opts: ['bed linen', 'towels', 'food'], ans: 1 },
            { q: 'The supermarket is', opts: ['next to the lake', 'ten minutes away on foot', 'closed on Saturdays'], ans: 1 },
            { q: 'Dogs are allowed', opts: ['in all cottages', 'only in Willow', 'in the cottages by the forest'], ans: 2 },
          ],
        },
      ],
    },
    {
      orderNo: 2,
      title: 'Riverside Community Centre',
      audio: { name: 'section-2.mp3', path: 'exam-skills/s1/audio/sec2.mp3', sizeBytes: 6396313, durationSec: 390 },
      imgs: [],
      paras: [
        "[00:00] GUIDE: Welcome to the Riverside Community Centre. I'll start with a quick tour using the plan you've been given.",
      ],
      groups: [
        {
          id: 'grp-l-3',
          type: 'DIAGRAM_COMP',
          instr: 'Label the plan below. Write NO MORE THAN TWO WORDS for each answer.',
          limit: 2,
          img: 'ban-do-trung-tam.png',
          marks: [[21, 35], [85, 31], [47, 48], [85, 77], [85, 55]],
          texts: ['', '', '', '', ''],
          ans: ['café', 'library', 'toilets', 'art studio', 'gym'],
          alt: ['cafe', null, null, null, null],
        },
        {
          id: 'grp-l-4',
          type: 'MATCH_FEATURE',
          instr: null,
          oneUse: true,
          opts: ['suitable for beginners', 'booking is essential', 'bring your own equipment', 'free for young people', 'new members wanted', 'held outdoors'],
          items: [
            { text: 'Pottery', ans: 0 },
            { text: 'Photography club', ans: 2 },
            { text: 'Yoga', ans: 1 },
            { text: 'Chess', ans: 3 },
            { text: 'Choir', ans: 4 },
          ],
        },
      ],
    },
    {
      orderNo: 3,
      title: 'Planning a presentation on urban bees',
      audio: { name: 'section-3.mp3', path: 'exam-skills/s1/audio/sec3.mp3', sizeBytes: 7130316, durationSec: 432 },
      imgs: [],
      paras: [
        '[00:00] TUTOR: So, Lucy and Tom, how is your presentation on urban bees coming along?',
      ],
      groups: [
        {
          id: 'grp-l-5',
          type: 'MCQ_MULTI',
          instr: null,
          q: 'Which TWO findings surprised the students?',
          pick: 2,
          opts: ['City bees make more honey.', 'City bees live longer.', 'City bees are exposed to fewer pesticides.', 'City hives are cheaper.', 'City bees are less aggressive.'],
          ans: [0, 2],
        },
        {
          id: 'grp-l-6',
          type: 'MCQ_MULTI',
          instr: null,
          q: 'Which TWO problems do the students mention?',
          pick: 2,
          opts: ['noise from traffic', 'few flowers in winter', 'theft of hives', 'disease between hives', 'strong winds on rooftops'],
          ans: [1, 3],
        },
        {
          id: 'grp-l-7',
          type: 'MCQ_SINGLE',
          instr: null,
          items: [
            { q: 'The students mainly used information from', opts: ['journal articles', 'a survey of beekeepers', 'a council website'], ans: 1 },
            { q: 'They will present the data using', opts: ['tables', 'a map', 'photographs'], ans: 1 },
            { q: 'The presentation will last', opts: ['ten minutes', 'fifteen minutes', 'twenty minutes'], ans: 1 },
          ],
        },
        {
          id: 'grp-l-8',
          type: 'SENTENCE_COMP',
          instr: null,
          items: [
            { text: 'The students will recommend planting more ___ in parks.', ans: 'wildflowers', alt: 'wild flowers' },
            { text: 'They plan to interview a council officer about the green ___ policy.', ans: 'roof', alt: null },
            { text: 'The tutor tells them to get ___ before the interview.', ans: 'permission', alt: null },
          ],
        },
      ],
    },
    {
      orderNo: 4,
      title: 'Sleep and memory',
      audio: { name: 'section-4.mp3', path: 'exam-skills/s1/audio/sec4.mp3', sizeBytes: 7969177, durationSec: 485 },
      imgs: [],
      paras: [
        "[00:00] LECTURER: Today I'm going to talk about how sleep helps us remember.",
      ],
      groups: [
        {
          id: 'grp-l-9',
          type: 'NOTE_COMP',
          instr: null,
          limit: 0,
          body: '## Sleep and memory\n**History**\n- 1924: people who slept after learning ___ less\n**Modern experiments**\n- volunteers learn word ___ in the evening\n- tested the next ___\n- biggest gains for ___ pairs\n**In the brain**\n- the ___ replays the day events during deep sleep\n- memories move to the ___ for long-term storage\n**Naps**\n- must include slow-wave sleep, about ___ minutes\n**Screens**\n- light delays the hormone ___\n**Advice**\n- no screens for an ___ before bed\n- keep a regular ___, even at weekends',
          ans: ['forgot', 'pairs', 'morning', 'difficult', 'hippocampus', 'cortex', 'sixty', 'melatonin', 'hour', 'bedtime'],
          alt: [null, null, null, null, null, null, '60', null, null, null],
        },
      ],
    },
  ],
};

test('pure functions handle text blanks, alternatives, and limits', () => {
  assert.equal(blanks('Hello ___ world _____!'), 2);
  assert.equal(blanks('No blanks here'), 0);

  const cut = cutBlank('A ___ and ___ together', 1);
  assert.equal(cut, 'A ___ and together');

  assert.deepEqual(parseAlt('cat, dog, bird'), ['cat', 'dog', 'bird']);
  assert.deepEqual(parseAlt('1,500, 2,000'), ['1,500', '2,000']);

  assert.equal(isNum('42'), true);
  assert.equal(isNum('1,500°C'), true);
  assert.equal(isNum('text'), false);

  // Limit 0: ONE WORD ONLY
  assert.equal(overLimit('one', 0), false);
  assert.equal(overLimit('two words', 0), true);

  // Limit 1: ONE WORD AND/OR A NUMBER
  assert.equal(overLimit('word 42', 1), false);
  assert.equal(overLimit('two words 42', 1), true);
});

test('numberQuestions returns exactly 40 for Reading and Listening fixtures', () => {
  const rNum = numberQuestions(READING_FULL);
  assert.equal(rNum.total, 40);
  assert.equal(rNum.starts[0].length, 3);
  assert.equal(rNum.starts[1].length, 3);
  assert.equal(rNum.starts[2].length, 3);

  const lNum = numberQuestions(LISTENING_FULL);
  assert.equal(lNum.total, 40);
  assert.equal(lNum.starts.length, 4);
});

test('allIssues validates complete fixtures as ready for publishing', () => {
  const rIssues = allIssues(READING_FULL, 'Passage', 3);
  assert.deepEqual(rIssues, []);

  const lIssues = allIssues(LISTENING_FULL, 'Section', 4);
  assert.deepEqual(lIssues, []);

  // Modify to trigger error: missing section
  const incomplete = { ...READING_FULL, passages: READING_FULL.passages.slice(0, 2) };
  const issues = allIssues(incomplete, 'Passage', 3);
  assert.ok(issues.some((i) => i.text.includes('cần đúng 40 câu')));
  assert.ok(issues.some((i) => i.text.includes('Passage 3 chưa được tạo')));
});

test('round-trip Reading: fromLrState(toLrState(FULL)) preserves integrity', () => {
  const originalContent = fromLrState(READING_FULL, 'READING');
  assert.equal(originalContent.sections.length, 3);

  const mockSkill = {
    id: 'skill-uuid-1',
    skill: 'READING',
    form: 'ACADEMIC',
    status: 'DRAFT',
    versionNumber: 1,
    durationMinutes: 60,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    exam: { id: 'exam-1', title: 'Practice Test 01', orderNo: 1 },
    set: { id: 'set-1', name: 'Cambridge 19' },
    slot: { liveId: null, liveStatus: null, liveVersion: null, draftId: 'skill-uuid-1', draftVersion: 1 },
    writing: null,
    speaking: null,
    reading: originalContent,
    listening: null,
  };

  const reloadedState = toLrState(mockSkill);
  assert.equal(reloadedState.passages.length, 3);
  const reloadedNumbering = numberQuestions(reloadedState);
  assert.equal(reloadedNumbering.total, 40);

  const secondContent = fromLrState(reloadedState, 'READING');
  assert.equal(secondContent.sections.length, 3);
  assert.equal(secondContent.sections[0].groups.length, 3);
  assert.equal(secondContent.sections[1].groups.length, 3);
  assert.equal(secondContent.sections[2].groups.length, 3);
});

test('round-trip Listening: fromLrState(toLrState(FULL)) preserves audio and transcripts', () => {
  const originalContent = fromLrState(LISTENING_FULL, 'LISTENING');
  assert.equal(originalContent.sections.length, 4);
  assert.ok(originalContent.sections[0].audio);
  assert.equal(originalContent.sections[0].audio.name, 'section-1.mp3');

  const mockSkill = {
    id: 'skill-uuid-2',
    skill: 'LISTENING',
    form: null,
    status: 'DRAFT',
    versionNumber: 1,
    durationMinutes: 40,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    exam: { id: 'exam-2', title: 'Practice Test 01', orderNo: 1 },
    set: { id: 'set-1', name: 'Cambridge 19' },
    slot: { liveId: null, liveStatus: null, liveVersion: null, draftId: 'skill-uuid-2', draftVersion: 1 },
    writing: null,
    speaking: null,
    reading: null,
    listening: originalContent,
  };

  const reloadedState = toLrState(mockSkill);
  assert.equal(reloadedState.passages.length, 4);
  const reloadedNumbering = numberQuestions(reloadedState);
  assert.equal(reloadedNumbering.total, 40);

  const secondContent = fromLrState(reloadedState, 'LISTENING');
  assert.equal(secondContent.sections.length, 4);
  assert.equal(secondContent.sections[0].audio.name, 'section-1.mp3');
  assert.equal(secondContent.sections[0].groups.length, 2);
  assert.equal(secondContent.sections[1].groups.length, 2);
  assert.equal(secondContent.sections[2].groups.length, 4);
  assert.equal(secondContent.sections[3].groups.length, 1);
});

test('diffLrContent computes minimal patch accurately', () => {
  const baseContent = fromLrState(READING_FULL, 'READING');

  // Case 1: Identical content -> empty patch
  const patch1 = diffLrContent(baseContent, baseContent);
  assert.deepEqual(patch1, {});

  // Case 2: Modify 1 answer in Passage 1 group 1
  const modifiedContent = JSON.parse(JSON.stringify(baseContent));
  modifiedContent.sections[0].groups[0].questions[0].accepted = ['modified answer'];

  const patch2 = diffLrContent(baseContent, modifiedContent);
  assert.equal(patch2.sections, undefined);
  assert.equal(patch2.deleteGroupIds, undefined);
  assert.equal(patch2.moveGroups, undefined);
  assert.equal(patch2.upsertGroups?.length, 1);
  assert.equal(patch2.upsertGroups[0].id, 'grp-r-1');
  assert.equal(patch2.upsertGroups[0].sectionOrderNo, 1);
  assert.equal(patch2.upsertGroups[0].orderNo, 1);

  // Case 3: Shift group order within section (move without content change)
  const movedContent = JSON.parse(JSON.stringify(baseContent));
  const temp = movedContent.sections[0].groups[0];
  movedContent.sections[0].groups[0] = movedContent.sections[0].groups[1];
  movedContent.sections[0].groups[1] = temp;

  const patch3 = diffLrContent(baseContent, movedContent);
  assert.ok(patch3.moveGroups?.length >= 2);
  assert.equal(patch3.upsertGroups, undefined);

  // Case 4: Delete a group
  const deletedContent = JSON.parse(JSON.stringify(baseContent));
  deletedContent.sections[0].groups.splice(0, 1);

  const patch4 = diffLrContent(baseContent, deletedContent);
  assert.deepEqual(patch4.deleteGroupIds, ['grp-r-1']);

  // Case 5: Update section title
  const titleChangedContent = JSON.parse(JSON.stringify(baseContent));
  titleChangedContent.sections[0].title = 'New Passage Title';

  const patch5 = diffLrContent(baseContent, titleChangedContent);
  assert.equal(patch5.sections?.length, 1);
  assert.equal(patch5.sections[0].title, 'New Passage Title');
});

test('applySavedIds correctly assigns backend IDs to newly created groups', () => {
  const clientState = {
    ...READING_FULL,
    passages: [
      {
        ...READING_FULL.passages[0],
        groups: [
          { ...READING_FULL.passages[0].groups[0], id: undefined },
        ],
      },
    ],
  };

  const savedSkill = {
    id: 'skill-uuid-1',
    skill: 'READING',
    form: 'ACADEMIC',
    status: 'DRAFT',
    versionNumber: 1,
    durationMinutes: 60,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    exam: { id: 'exam-1', title: 'Practice Test 01', orderNo: 1 },
    set: { id: 'set-1', name: 'Cambridge 19' },
    slot: { liveId: null, liveStatus: null, liveVersion: null, draftId: 'skill-uuid-1', draftVersion: 1 },
    writing: null,
    speaking: null,
    reading: {
      sections: [
        {
          orderNo: 1,
          title: 'The history of glass',
          paragraphs: [],
          images: [],
          audio: null,
          groups: [
            {
              id: 'newly-assigned-db-uuid',
              type: 'SENTENCE_COMP',
              instruction: '',
              title: null,
              questionFrom: 1,
              questionTo: 5,
              image: null,
              config: {},
              content: {},
              questions: [],
            },
          ],
        },
      ],
    },
    listening: null,
  };

  const updatedState = applySavedIds(clientState, savedSkill);
  assert.equal(updatedState.passages[0].groups[0].id, 'newly-assigned-db-uuid');
});

test('groupOfType and comboOptions categorize 5 groups accurately', () => {
  // Group 1: Sentence
  assert.equal(groupOfType('SENTENCE_COMP'), 'blank-sentence');
  assert.equal(groupOfType('SHORT_ANSWER'), 'blank-sentence');

  // Group 2: Passage
  assert.equal(groupOfType('SUMMARY_COMP'), 'blank-passage');
  assert.equal(groupOfType('NOTE_COMP'), 'blank-passage');
  assert.equal(groupOfType('SUMMARY_BOX'), 'blank-passage');

  // Group 3: Table / Diagram
  assert.equal(groupOfType('TABLE_COMP'), 'table-diagram');
  assert.equal(groupOfType('DIAGRAM_COMP'), 'table-diagram');

  // Group 4: Matching
  assert.equal(groupOfType('MATCH_HEADING'), 'matching');
  assert.equal(groupOfType('MATCH_INFO'), 'matching');
  assert.equal(groupOfType('MATCH_FEATURE'), 'matching');
  assert.equal(groupOfType('MATCH_ENDING'), 'matching');

  // Group 5: Choice
  assert.equal(groupOfType('MCQ_SINGLE'), 'choice');
  assert.equal(groupOfType('MCQ_MULTI'), 'choice');
  assert.equal(groupOfType('TFNG'), 'choice');
  assert.equal(groupOfType('YNNG'), 'choice');

  // Reading options for Matching
  const readingMatchOpts = comboOptions('MATCH_FEATURE');
  assert.equal(readingMatchOpts.length, 3);
  assert.equal(readingMatchOpts[0].type, 'MATCH_HEADING');
  assert.equal(readingMatchOpts[2].label, 'Matching Features / Sentence Endings');

  // Listening options for Matching: only MATCH_FEATURE allowed
  const listeningAllowed = ['NOTE_COMP', 'SUMMARY_COMP', 'MATCH_FEATURE', 'MCQ_SINGLE'];
  const listeningMatchOpts = comboOptions('MATCH_FEATURE', listeningAllowed);
  assert.equal(listeningMatchOpts.length, 1);
  assert.equal(listeningMatchOpts[0].type, 'MATCH_FEATURE');
});

test('groupHasData detects empty vs non-empty groups correctly', () => {
  // Empty groups
  assert.equal(groupHasData({ type: 'SENTENCE_COMP', instr: null, items: [] }), false);
  assert.equal(groupHasData({ type: 'SUMMARY_COMP', instr: null, body: '', items: [] }), false);
  assert.equal(groupHasData({ type: 'MCQ_SINGLE', instr: null, items: [{ q: '', opts: ['', ''] }] }), false);

  // Group with text in body
  assert.equal(groupHasData({ type: 'SUMMARY_COMP', instr: null, body: 'Some text with ___' }), true);

  // Group with items / answers
  assert.equal(
    groupHasData({ type: 'SENTENCE_COMP', instr: null, items: [{ text: 'Question', ans: 'answer' }] }),
    true
  );

  // Group with options
  assert.equal(groupHasData({ type: 'SUMMARY_BOX', instr: null, opts: ['word1', 'word2'] }), true);

  // Group with marks
  assert.equal(groupHasData({ type: 'DIAGRAM_COMP', instr: null, marks: [{ x: 10, y: 20 }] }), true);
});


