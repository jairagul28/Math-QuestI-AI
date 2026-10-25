const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildDailyChallenges,
  verifyChallengeQuestions,
} = require('../services/dailyChallengeService');
const { toPublicChallenge } = require('../controllers/challengeController');

const standard = { title: 'Fraction addition', standardCode: '5.NR.3', category: 'Fractions' };

test('daily challenges are repeatable for a date and grade but change with the seed', () => {
  const first = buildDailyChallenges('2026-10-25', 5, [standard]);
  const repeated = buildDailyChallenges('2026-10-25', 5, [standard]);
  const nextDay = buildDailyChallenges('2026-10-26', 5, [standard]);

  assert.deepEqual(repeated, first);
  assert.notDeepEqual(nextDay, first);
  assert.deepEqual(first.map((challenge) => challenge.code), [
    'quick-fire',
    'standard-spotlight',
    'boss-quest',
  ]);
});

test('challenge formats have the required question counts and no invalid answer options', () => {
  const challenges = buildDailyChallenges('2026-10-25', 5, [standard]);
  assert.equal(challenges[0].questions.length, 5);
  assert.equal(challenges[1].questions.length, 5);
  assert.equal(challenges[2].questions.length, 1);
  assert.equal(challenges[0].durationSeconds, 180);
  assert.equal(challenges[1].standardCode, '5.NR.3');
  assert.equal(verifyChallengeQuestions(challenges), true);

  for (const challenge of challenges) {
    for (const question of challenge.questions) {
      assert.equal(question.options.length, 4);
      assert.equal(new Set(question.options).size, 4);
      assert.equal(
        question.options[question.correctOptionIndex],
        question.expectedAnswer
      );
    }
  }
});

test('spotlight content is aligned to the selected topic category', () => {
  const ratioTopic = { title: 'Ratios', standardCode: '6.NR.4', category: 'Ratios & Proportions' };
  const challenges = buildDailyChallenges('2026-10-25', 6, [ratioTopic]);
  assert.equal(challenges[1].standardCode, '6.NR.4');
  assert.ok(challenges[1].questions.every((question) => question.questionText.includes('ratio')));
});

test('public challenge questions do not expose answers or explanations', () => {
  const challenge = buildDailyChallenges('2026-10-25', 5, [standard])[0];
  const publicChallenge = toPublicChallenge(challenge, null);
  for (const question of publicChallenge.questions) {
    assert.equal('correctOptionIndex' in question, false);
    assert.equal('expectedAnswer' in question, false);
    assert.equal('explanation' in question, false);
  }
});
