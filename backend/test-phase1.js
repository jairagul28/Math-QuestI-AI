const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('======================================================');
  console.log('🧪 MATHQUEST AI — PHASE 1 SYSTEM VERIFICATION SUITE');
  console.log('======================================================');

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
    // 1. Health check
    console.log('\n[1] Testing Backend Health & Groq Configuration...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/health returns 200');
    assert(healthData.status === 'healthy', 'System status is healthy');
    assert(healthData.database === 'connected', 'MongoDB connection verified');
    assert(typeof healthData.groqModel === 'string', `Groq Model configured: ${healthData.groqModel}`);

    // 2. Topics retrieval from MongoDB
    console.log('\n[2] Testing Topics Retrieval from MongoDB...');
    const topicsRes = await fetch(`${BASE_URL}/topics`);
    const topicsData = await topicsRes.json();
    assert(topicsRes.status === 200, 'GET /api/topics returns 200');
    assert(topicsData.count >= 8, `Retrieved ${topicsData.count} Georgia Standards topics`);

    // Grade 5 filter
    const g5Res = await fetch(`${BASE_URL}/topics?grade=5`);
    const g5Data = await g5Res.json();
    assert(g5Data.data.every((t) => t.grade === 5), 'GET /api/topics?grade=5 filters strictly Grade 5');

    // Grade 6 filter
    const g6Res = await fetch(`${BASE_URL}/topics?grade=6`);
    const g6Data = await g6Res.json();
    assert(g6Data.data.every((t) => t.grade === 6), 'GET /api/topics?grade=6 filters strictly Grade 6');
    assert(
      g6Data.data.some((t) => t.category === 'Ratios & Proportions'),
      'Ratios & Proportions present in Grade 6 standards'
    );
    assert(
      !g5Data.data.some((t) => t.category === 'Ratios & Proportions'),
      'Ratios & Proportions omitted from Grade 5 (grade-differentiated curriculum)'
    );

    // Single topic lookup
    const sampleTopic = topicsData.data[0];
    const singleTopicRes = await fetch(`${BASE_URL}/topics/${sampleTopic._id}`);
    const singleTopicData = await singleTopicRes.json();
    assert(singleTopicRes.status === 200, `GET /api/topics/:id returns correct topic: ${sampleTopic.title}`);

    // 3. Authentication: Student Registration
    console.log('\n[3] Testing Real MongoDB User Registration...');
    const testEmail = `test_student_${Date.now()}@mathquest.edu`;
    const regPayload = {
      name: 'Maya Lin',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      grade: 5,
    };

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(Boolean(regData.token), 'JWT token issued upon registration');
    assert(regData.user.name === 'Maya Lin', 'Student name saved in MongoDB');
    assert(regData.user.grade === 5, 'Grade 5 saved correctly');
    assert(regData.user.passwordHash === undefined, 'passwordHash is NOT exposed in response');

    const authToken = regData.token;

    // Duplicate email registration prevention
    console.log('\n[4] Testing Duplicate Email Prevention...');
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 400, 'Duplicate email rejected with HTTP 400');
    assert(dupData.message.includes('already exists'), 'Duplicate email error message verified');

    // 4. Student Login
    console.log('\n[5] Testing Student Login & Password Verification...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'POST /api/auth/login returns 200');
    assert(Boolean(loginData.token), 'Valid JWT token returned on login');
    assert(loginData.user.email === testEmail, 'Logged in user email matches');

    // Wrong password check
    const wrongLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'wrongPassword!' }),
    });
    assert(wrongLoginRes.status === 401, 'Invalid password rejected with HTTP 401');

    // 5. Protected Route /api/auth/me
    console.log('\n[6] Testing Protected Profile Route (/api/auth/me)...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 with valid JWT');
    assert(meData.data.name === 'Maya Lin', 'Authenticated profile retrieved accurately');

    // Rejection without token
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    assert(noTokenRes.status === 401, 'Unauthenticated request rejected with HTTP 401');

    // 6. Student Dashboard (/api/users/dashboard)
    console.log('\n[7] Testing Student Dashboard Endpoint (/api/users/dashboard)...');
    const dashRes = await fetch(`${BASE_URL}/users/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200, 'GET /api/users/dashboard returns 200');
    assert(dashData.data.stats.totalXP === 0, 'New student starts at real 0 XP (no fabricated data)');
    assert(dashData.data.stats.lessonsCompleted === 0, 'Lessons completed count is 0 for new student');
    assert(dashData.data.topicProgress.length > 0, 'Curriculum topic progress list loaded for Grade 5');
    assert(dashData.data.achievements.length === 0, 'Achievements array is empty for new student (no fake badges)');
    assert(Boolean(dashData.data.continueLearning), 'Continue Learning recommended module populated');

    console.log('\n======================================================');
    console.log(`🎉 VERIFICATION RESULT: ${passCount}/${testCount} TESTS PASSED`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('Fatal test error:', error.message);
  }
}

runVerification();

