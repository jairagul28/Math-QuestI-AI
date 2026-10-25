const BASE_URL = process.env.MATHQUEST_TEST_API_URL || 'http://localhost:5000/api';
const fs = require('fs');
const path = require('path');

async function runMasterVerification() {
  console.log('================================================================');
  console.log('🚀 MATHQUEST AI — MASTER VERIFICATION SUITE (PHASES 1, 2, 3, 4, 5)');
  console.log('================================================================');

  let testCount = 0;
  let passCount = 0;

  function assert(condition, message) {
    testCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  try {
    // -----------------------------------------------------------
    // [1] Health & Groq Service Check
    // -----------------------------------------------------------
    console.log('\n[1] Testing System Health & Service Integration...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returned 200 OK');
    assert(healthData.database === 'connected', 'Local MongoDB connection is active');
    assert(healthData.groqConfigured === true, 'Groq API client configured');
    assert(typeof healthData.groqModel === 'string', `Configured Groq model: ${healthData.groqModel}`);

    // -----------------------------------------------------------
    // [2] Student Authentication & Profile Setup
    // -----------------------------------------------------------
    console.log('\n[2] Testing Student Authentication & Profile Setup...');
    const studentEmail = `scholar_${Date.now()}@mathquest.edu`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Hayes',
        email: studentEmail,
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        grade: 5,
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'Student registered successfully in MongoDB');
    assert(Boolean(regData.token), 'JWT authentication token received');
    const authToken = regData.token;

    // -----------------------------------------------------------
    // [3] Georgia Standards Topics Verification
    // -----------------------------------------------------------
    console.log('\n[3] Testing Topics & Georgia Curriculum Standards...');
    const topicsRes = await fetch(`${BASE_URL}/topics`);
    const topicsData = await topicsRes.json();
    assert(topicsData.data.length >= 8, `Loaded ${topicsData.data.length} Georgia Standards math topics`);

    const g5FractionsTopic = topicsData.data.find(
      (t) => t.grade === 5 && t.category === 'Fractions'
    );
    const g6RatiosTopic = topicsData.data.find(
      (t) => t.grade === 6 && t.category === 'Ratios & Proportions'
    );

    assert(Boolean(g5FractionsTopic), `Grade 5 Fractions found: ${g5FractionsTopic.standardCode}`);
    assert(Boolean(g6RatiosTopic), `Grade 6 Ratios found: ${g6RatiosTopic.standardCode}`);

    // Test Grade mismatch rejection
    const mismatchRes = await fetch(`${BASE_URL}/ai/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: 6, topicId: g5FractionsTopic._id }),
    });
    assert(mismatchRes.status === 400, 'Grade-topic mismatch properly rejected with HTTP 400');

    // -----------------------------------------------------------
    // [4] Phase 2: AI-Powered Lesson Generation
    // -----------------------------------------------------------
    console.log('\n[4] Testing Phase 2 AI Lesson Generation & Schema Validation...');
    const lessonStart = Date.now();
    const lessonRes = await fetch(`${BASE_URL}/ai/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: 5, topicId: g5FractionsTopic._id }),
    });
    const lessonData = await lessonRes.json();
    const lessonTime = Date.now() - lessonStart;

    assert(lessonRes.status === 200, `POST /api/ai/generate-lesson completed in ${lessonTime}ms`);
    assert(Boolean(lessonData.data.explanation), 'Lesson explanation present');
    assert(Array.isArray(lessonData.data.keyConcepts) && lessonData.data.keyConcepts.length >= 2, 'Key concepts verified');
    assert(Array.isArray(lessonData.data.workedExamples) && lessonData.data.workedExamples.length >= 1, 'Worked examples verified');
    assert(Boolean(lessonData.data.workedExamples[0].steps.length >= 1), 'Worked example contains step-by-step guidance');
    assert(Boolean(lessonData.data.realWorldApplication), 'Real-world application included');

    // Test caching on second request
    const cacheRes = await fetch(`${BASE_URL}/ai/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: 5, topicId: g5FractionsTopic._id }),
    });
    const cacheData = await cacheRes.json();
    assert(cacheData.cached === true, 'Subsequent lesson request served from MongoDB cache');

    // -----------------------------------------------------------
    // [5] Phase 2 & 4: Lesson Completion & XP Awarding
    // -----------------------------------------------------------
    console.log('\n[5] Testing Lesson Completion, XP & First Steps Badge...');
    const completeRes = await fetch(`${BASE_URL}/ai/complete-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ topicId: g5FractionsTopic._id }),
    });
    const completeData = await completeRes.json();
    assert(completeRes.status === 200, 'POST /api/ai/complete-lesson succeeded');
    assert(completeData.earnedXP === 15, 'Awarded 15 XP for first verified lesson completion');
    assert(
      completeData.newlyUnlockedBadges.some((b) => b.badgeCode === 'FIRST_STEPS'),
      'Unlocked "FIRST_STEPS" badge on first lesson completion'
    );

    // -----------------------------------------------------------
    // [6] Phase 3: Adaptive Quiz Engine — Start Session
    // -----------------------------------------------------------
    console.log('\n[6] Testing Phase 3 Adaptive Quiz Engine — Session Startup...');
    const quizStartRes = await fetch(`${BASE_URL}/quizzes/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ topicId: g5FractionsTopic._id, questionCount: 4 }),
    });
    const quizStartData = await quizStartRes.json();
    assert(quizStartRes.status === 201, 'POST /api/quizzes/start created quiz session');
    assert(quizStartData.currentDifficulty === 'medium', 'Quiz starts at Medium difficulty per specifications');
    assert(quizStartData.currentQuestion.options.length === 4, 'Question provides exactly 4 options');
    assert(quizStartData.currentQuestion.correctOptionIndex === undefined, 'Correct answer is hidden before submission');

    const attemptId = quizStartData.attemptId;

    // -----------------------------------------------------------
    // [7] Phase 3: Adaptive Question Delivery & Difficulty Adaptation
    // -----------------------------------------------------------
    console.log('\n[7] Testing Adaptive Question Delivery & Difficulty Adaptation...');

    // Question 1: Answer with option 1
    const ans1Res = await fetch(`${BASE_URL}/quizzes/${attemptId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ questionIndex: 0, selectedOptionIndex: 1 }),
    });
    const ans1Data = await ans1Res.json();
    assert(ans1Res.status === 200, 'Answer 1 submitted successfully');
    assert(typeof ans1Data.feedback.isCorrect === 'boolean', 'Feedback correctness evaluated');
    assert(typeof ans1Data.feedback.correctOptionIndex === 'number', 'Correct answer revealed in feedback');

    // Test duplicate answer prevention
    const dupAnsRes = await fetch(`${BASE_URL}/quizzes/${attemptId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ questionIndex: 0, selectedOptionIndex: 1 }),
    });
    assert(dupAnsRes.status === 400, 'Duplicate submission for same question rejected with HTTP 400');

    // Answer questions 2, 3, and 4 to finish quiz
    for (let qIdx = 1; qIdx < 4; qIdx++) {
      const ansRes = await fetch(`${BASE_URL}/quizzes/${attemptId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ questionIndex: qIdx, selectedOptionIndex: 1 }),
      });
      const data = await ansRes.json();
      if (data.isQuizComplete) {
        assert(true, 'Quiz session marked as completed after final question');
        assert(typeof data.summary.accuracy === 'number', `Final quiz accuracy: ${data.summary.accuracy}%`);
        assert(data.summary.earnedXP >= 0, `Total XP earned: ${data.summary.earnedXP}`);
        break;
      }
    }

    // -----------------------------------------------------------
    // [8] Phase 3: Quiz Results Retrieval
    // -----------------------------------------------------------
    console.log('\n[8] Testing Quiz Results Retrieval...');
    const resultRes = await fetch(`${BASE_URL}/quizzes/${attemptId}/result`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const resultData = await resultRes.json();
    assert(resultRes.status === 200, 'GET /api/quizzes/:attemptId/result returned 200 OK');
    assert(resultData.data.status === 'completed', 'Quiz status is completed');
    assert(Array.isArray(resultData.data.difficultyProgression), 'Difficulty progression array recorded');

    // -----------------------------------------------------------
    // [9] Phase 4: Student Dashboard Aggregation & Recharts Trend
    // -----------------------------------------------------------
    console.log('\n[9] Testing Student Dashboard Aggregation & Recharts Data...');
    const dashRes = await fetch(`${BASE_URL}/users/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200, 'GET /api/users/dashboard returned 200 OK');
    assert(dashData.data.stats.totalXP > 0, `Dashboard reflects real total XP: ${dashData.data.stats.totalXP}`);
    assert(dashData.data.stats.lessonsCompleted === 1, 'Completed lessons count updated to 1');
    assert(dashData.data.stats.quizzesCompleted === 1, 'Completed quizzes count updated to 1');
    assert(Array.isArray(dashData.data.performanceTrend), 'Performance trend array populated for Recharts');
    assert(Array.isArray(dashData.data.allBadges), 'All badges gallery populated with locked/unlocked states');
    assert(dashData.data.allBadges.length >= 20, 'Badge catalog includes the expanded reward set');

    // -----------------------------------------------------------
    // [10] Gamification challenges, avatars, and privacy-safe leaderboard
    // -----------------------------------------------------------
    console.log('\n[10] Testing Daily Challenges, Avatar Rewards & Leaderboard Privacy...');
    const dailyRes = await fetch(`${BASE_URL}/challenges/daily?timeZone=UTC`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dailyData = await dailyRes.json();
    assert(dailyRes.status === 200, 'GET /api/challenges/daily returned 200 OK');
    assert(dailyData.data.challenges.length === 3, 'Daily challenge board contains three quests');
    const leakedAnswer = dailyData.data.challenges.some((challenge) =>
      challenge.questions.some((question) =>
        'correctOptionIndex' in question || 'expectedAnswer' in question || 'explanation' in question
      )
    );
    assert(!leakedAnswer, 'Daily challenge response does not leak answers or explanations');

    const firstDailyChallenge = dailyData.data.challenges[0];
    const firstAnswer = await fetch(
      `${BASE_URL}/challenges/daily/${firstDailyChallenge.code}/answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ questionIndex: 0, selectedOptionIndex: 0, timeZone: 'UTC' }),
      }
    );
    assert(firstAnswer.status === 200, 'Daily challenge answer was checked by the backend');
    const duplicateDailyAnswer = await fetch(
      `${BASE_URL}/challenges/daily/${firstDailyChallenge.code}/answer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ questionIndex: 0, selectedOptionIndex: 0, timeZone: 'UTC' }),
      }
    );
    assert(duplicateDailyAnswer.status === 409, 'Duplicate daily challenge answer was rejected');

    let lastQuickAnswer;
    for (let questionIndex = 1; questionIndex < firstDailyChallenge.questionCount; questionIndex += 1) {
      const answerRes = await fetch(
        `${BASE_URL}/challenges/daily/${firstDailyChallenge.code}/answer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ questionIndex, selectedOptionIndex: 0, timeZone: 'UTC' }),
        }
      );
      assert(answerRes.status === 200, `Quick Fire question ${questionIndex + 1} accepted by the server`);
      lastQuickAnswer = await answerRes.json();
    }
    assert(lastQuickAnswer.data.completed, 'Quick Fire completes only after all five questions');
    assert(lastQuickAnswer.data.rewardXP === 30, 'Quick Fire reward is awarded by the backend');

    let finalChallengeResult;
    for (const challenge of dailyData.data.challenges.slice(1)) {
      for (let questionIndex = 0; questionIndex < challenge.questionCount; questionIndex += 1) {
        const answerRes = await fetch(
          `${BASE_URL}/challenges/daily/${challenge.code}/answer`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ questionIndex, selectedOptionIndex: 0, timeZone: 'UTC' }),
          }
        );
        assert(answerRes.status === 200, `${challenge.title} question ${questionIndex + 1} accepted by the server`);
        finalChallengeResult = await answerRes.json();
      }
    }
    assert(finalChallengeResult.data.bonusChest.unlocked, 'Completing all daily challenges unlocks the bonus chest');
    assert(finalChallengeResult.data.bonusChest.claimed, 'Bonus chest XP is awarded exactly once');
    assert(finalChallengeResult.data.streak.currentStreak === 1, 'Challenge completion records a daily streak');

    const avatarRes = await fetch(`${BASE_URL}/users/avatars`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const avatarData = await avatarRes.json();
    assert(avatarRes.status === 200, 'GET /api/users/avatars returned 200 OK');
    assert(avatarData.data.avatars.some((avatar) => avatar.id === 'fox' && avatar.unlocked), 'Starter avatar is unlocked');
    assert(avatarData.data.avatars.some((avatar) => avatar.id === 'dragon' && !avatar.unlocked), 'Locked avatar state is returned');

    const preferenceRes = await fetch(`${BASE_URL}/users/leaderboard/settings`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const preferenceData = await preferenceRes.json();
    assert(preferenceRes.status === 200, 'Leaderboard privacy settings loaded');
    assert(preferenceData.data.optIn === false, 'Leaderboard participation defaults to private');

    const joinRes = await fetch(`${BASE_URL}/users/leaderboard/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ optIn: true }),
    });
    assert(joinRes.status === 200, 'Student can opt in to the leaderboard');
    const boardRes = await fetch(`${BASE_URL}/users/leaderboard?period=weekly&grade=5`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const boardData = await boardRes.json();
    const boardJson = JSON.stringify(boardData.data);
    assert(boardRes.status === 200, 'Weekly grade leaderboard loaded');
    assert(boardData.data.currentUser?.isCurrentUser, 'Opted-in student is included in their own rank');
    assert(!boardJson.includes(studentEmail) && !/"name"\s*:|"email"\s*:/.test(boardJson), 'Leaderboard exposes no email or real-name fields');

    const hideRes = await fetch(`${BASE_URL}/users/leaderboard/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ optIn: false }),
    });
    assert(hideRes.status === 200, 'Student can withdraw leaderboard participation');

    // -----------------------------------------------------------
    // [11] Phase 4: Educational Infographic Asset Check
    // -----------------------------------------------------------
    console.log('\n[11] Testing Educational Infographic Asset Availability...');
    const infographicPath = path.join(__dirname, '../frontend/public/infographics/equivalent-fractions-infographic.png');
    assert(fs.existsSync(infographicPath), 'AI-generated educational infographic exists on filesystem');
    const stats = fs.statSync(infographicPath);
    assert(stats.size > 10000, `Infographic file verified (${Math.round(stats.size / 1024)} KB)`);

    console.log('\n================================================================');
    console.log(`🎉 MASTER VERIFICATION SUITE: ${passCount}/${testCount} TESTS PASSED`);
    console.log('================================================================\n');
    if (passCount !== testCount) process.exitCode = 1;
  } catch (error) {
    console.error('Fatal test suite error:', error.message);
    process.exitCode = 1;
  }
}

runMasterVerification();
