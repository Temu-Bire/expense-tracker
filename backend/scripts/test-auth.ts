import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { config } from '../src/config/env';

interface HttpResponse {
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: any;
}

function request(
  url: string,
  options: http.RequestOptions = {},
  postData?: string
): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(data);
        } catch {
          parsedBody = data;
        }
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body: parsedBody,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAuthTests() {
  console.log('🧪 Starting Authentication & Authorization Security Test Suite...\n');

  const app = createApp();
  const TEST_PORT = 5098;
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`📡 Test server listening on ${baseUrl}\n`);
      resolve();
    });
  });

  let totalTests = 0;
  let passedTests = 0;

  const assert = (condition: boolean, title: string, details?: string) => {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ PASSED: ${title}`);
      if (details) console.log(`     ${details}`);
    } else {
      console.error(`  ❌ FAILED: ${title}`);
      if (details) console.error(`     ${details}`);
    }
  };

  try {
    const testEmail = `tester_${Date.now()}@example.com`;
    const testPassword = 'StrongPassword123!';
    let userAccessToken = '';
    let userRefreshToken = '';

    // Test 1: User Registration
    console.log('▶ Scenario 1: User Registration (POST /api/auth/register)');
    const regRes = await request(
      `${baseUrl}/api/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Alex',
        lastName: 'Tester',
        currency: 'USD',
      })
    );

    assert(
      regRes.statusCode === 201 &&
        regRes.body?.success === true &&
        regRes.body?.data?.user?.email === testEmail &&
        !regRes.body?.data?.user?.passwordHash &&
        typeof regRes.body?.data?.tokens?.accessToken === 'string' &&
        typeof regRes.body?.data?.tokens?.refreshToken === 'string',
      'Successful registration yields user data (no plain-text password) and token pair',
      `User ID: ${regRes.body?.data?.user?.id}`
    );

    userAccessToken = regRes.body?.data?.tokens?.accessToken;
    userRefreshToken = regRes.body?.data?.tokens?.refreshToken;

    // Test 2: Duplicate Registration Prevention
    console.log('\n▶ Scenario 2: Duplicate Email Prevention');
    const dupRes = await request(
      `${baseUrl}/api/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({
        email: testEmail,
        password: testPassword,
      })
    );

    assert(
      dupRes.statusCode === 409 &&
        dupRes.body?.success === false &&
        dupRes.body?.error?.code === 'CONFLICT',
      'Duplicate registration rejected with 409 CONFLICT',
      `Message: ${dupRes.body?.error?.message}`
    );

    // Test 3: Invalid Credentials (Wrong Password)
    console.log('\n▶ Scenario 3: Login with Invalid Password');
    const badPassRes = await request(
      `${baseUrl}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999!',
      })
    );

    assert(
      badPassRes.statusCode === 401 &&
        badPassRes.body?.success === false &&
        badPassRes.body?.error?.code === 'UNAUTHORIZED',
      'Invalid password rejected with 401 UNAUTHORIZED',
      `Message: ${badPassRes.body?.error?.message}`
    );

    // Test 4: Invalid Credentials (Unknown Email)
    console.log('\n▶ Scenario 4: Login with Unknown Email');
    const badUserRes = await request(
      `${baseUrl}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({
        email: 'nobody@nonexistent.domain',
        password: 'AnyPassword123!',
      })
    );

    assert(
      badUserRes.statusCode === 401 &&
        badUserRes.body?.success === false &&
        badUserRes.body?.error?.code === 'UNAUTHORIZED',
      'Non-existent account rejected with 401 UNAUTHORIZED'
    );

    // Test 5: Valid Login
    console.log('\n▶ Scenario 5: Login with Valid Credentials');
    const loginRes = await request(
      `${baseUrl}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({
        email: testEmail,
        password: testPassword,
      })
    );

    assert(
      loginRes.statusCode === 200 &&
        loginRes.body?.success === true &&
        typeof loginRes.body?.data?.tokens?.accessToken === 'string',
      'Valid credentials authenticate and return new token pair'
    );

    if (loginRes.body?.data?.tokens?.accessToken) {
      userAccessToken = loginRes.body.data.tokens.accessToken;
      userRefreshToken = loginRes.body.data.tokens.refreshToken;
    }

    // Test 6: Access Protected Route with Valid Access Token
    console.log('\n▶ Scenario 6: Current User Endpoint (GET /api/auth/me) with Valid Token');
    const meRes = await request(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    });

    assert(
      meRes.statusCode === 200 &&
        meRes.body?.success === true &&
        meRes.body?.data?.email === testEmail,
      'Authenticated access to /api/auth/me succeeds',
      `Profile: ${meRes.body?.data?.firstName} ${meRes.body?.data?.lastName} (${meRes.body?.data?.email})`
    );

    // Test 7: Unauthorized Request - Missing Token
    console.log('\n▶ Scenario 7: Protected Route with Missing Authorization Header');
    const noTokenRes = await request(`${baseUrl}/api/auth/me`, {
      method: 'GET',
    });

    assert(
      noTokenRes.statusCode === 401 &&
        noTokenRes.body?.success === false &&
        noTokenRes.body?.error?.code === 'UNAUTHORIZED',
      'Missing token yields 401 UNAUTHORIZED',
      `Error Message: ${noTokenRes.body?.error?.message}`
    );

    // Test 8: Unauthorized Request - Protected Transactions Route Missing Token
    console.log('\n▶ Scenario 8: Protected /api/transactions with Missing Token');
    const noTxTokenRes = await request(`${baseUrl}/api/transactions`, {
      method: 'GET',
    });

    assert(
      noTxTokenRes.statusCode === 401 &&
        noTxTokenRes.body?.success === false &&
        noTxTokenRes.body?.error?.code === 'UNAUTHORIZED',
      'Protected transactions endpoint blocks unauthenticated calls'
    );

    // Test 9: Malformed Token
    console.log('\n▶ Scenario 9: Malformed / Invalid JWT Token');
    const badTokenRes = await request(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer this.is.an.invalid.token',
      },
    });

    assert(
      badTokenRes.statusCode === 401 &&
        badTokenRes.body?.success === false &&
        badTokenRes.body?.error?.code === 'UNAUTHORIZED',
      'Malformed JWT yields 401 UNAUTHORIZED'
    );

    // Test 10: Expired Token
    console.log('\n▶ Scenario 10: Expired JWT Access Token Rejection');
    const expiredToken = jwt.sign(
      { userId: 'test-user-id', email: testEmail },
      config.jwtAccessSecret,
      { expiresIn: '-5s' }
    );

    const expiredRes = await request(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${expiredToken}`,
      },
    });

    assert(
      expiredRes.statusCode === 401 &&
        expiredRes.body?.success === false &&
        expiredRes.body?.error?.code === 'UNAUTHORIZED' &&
        expiredRes.body?.error?.message?.toLowerCase().includes('expired'),
      'Expired access token rejected with 401 and expiration detail',
      `Message: ${expiredRes.body?.error?.message}`
    );

    // Test 11: Refresh Token Strategy & Rotation
    console.log('\n▶ Scenario 11: Refresh Token Flow & Rotation (POST /api/auth/refresh)');
    const refreshRes = await request(
      `${baseUrl}/api/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({
        refreshToken: userRefreshToken,
      })
    );

    assert(
      refreshRes.statusCode === 200 &&
        refreshRes.body?.success === true &&
        typeof refreshRes.body?.data?.tokens?.accessToken === 'string' &&
        typeof refreshRes.body?.data?.tokens?.refreshToken === 'string',
      'Valid refresh token issues a new rotated token pair',
      `New access token received`
    );

    const newAccessToken = refreshRes.body?.data?.tokens?.accessToken;
    const newRefreshToken = refreshRes.body?.data?.tokens?.refreshToken;

    // Test 12: Access with Rotated Token
    console.log('\n▶ Scenario 12: Verify Rotated Access Token');
    const rotatedMeRes = await request(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${newAccessToken}`,
      },
    });

    assert(
      rotatedMeRes.statusCode === 200 &&
        rotatedMeRes.body?.data?.email === testEmail,
      'Newly rotated access token successfully accesses protected endpoint'
    );

    // Test 13: Logout & Token Revocation
    console.log('\n▶ Scenario 13: Logout (POST /api/auth/logout)');
    const logoutRes = await request(
      `${baseUrl}/api/auth/logout`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({
        refreshToken: newRefreshToken,
      })
    );

    assert(
      logoutRes.statusCode === 200 && logoutRes.body?.success === true,
      'Logout successfully revokes refresh token'
    );

    // Test 14: Revoked Token Reuse Prevention
    console.log('\n▶ Scenario 14: Revoked Refresh Token Reuse Prevention');
    const reusedRefreshRes = await request(
      `${baseUrl}/api/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      JSON.stringify({
        refreshToken: newRefreshToken,
      })
    );

    assert(
      reusedRefreshRes.statusCode === 401 &&
        reusedRefreshRes.body?.success === false,
      'Attempt to refresh with revoked token is rejected'
    );

    console.log('\n===============================================');
    console.log(`Results: ${passedTests} / ${totalTests} test assertions passed.`);
    if (passedTests === totalTests) {
      console.log('🎉 ALL AUTHENTICATION & SECURITY TESTS PASSED!');
    } else {
      console.error('❌ SOME TESTS FAILED.');
      process.exitCode = 1;
    }
    console.log('===============================================\n');
  } catch (err) {
    console.error('💥 Error during test run:', err);
    process.exitCode = 1;
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  }
}

runAuthTests();
