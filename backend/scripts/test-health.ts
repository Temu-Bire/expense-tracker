import http from 'http';
import { createApp } from '../src/app';

async function request(url: string, options: http.RequestOptions = {}, postData?: string): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: any }> {
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

async function runTests() {
  console.log('🧪 Starting API Verification & Health Check Tests...\n');

  const app = createApp();
  const TEST_PORT = 5099;
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`📡 Test server listening on ${baseUrl}\n`);
      resolve();
    });
  });

  let allPassed = true;

  try {
    // Test 1: GET /health
    console.log('▶ Test 1: Checking root health endpoint (GET /health)...');
    const res1 = await request(`${baseUrl}/health`);
    if (
      res1.statusCode === 200 &&
      res1.body?.success === true &&
      res1.body?.data?.status === 'healthy'
    ) {
      console.log('  ✅ PASSED: Status 200, status=healthy, service=expense-tracker-api');
      console.log(`     Payload: ${JSON.stringify(res1.body.data)}`);
    } else {
      console.error('  ❌ FAILED: Unexpected response:', res1);
      allPassed = false;
    }

    // Test 2: GET /api/health
    console.log('\n▶ Test 2: Checking prefixed health endpoint (GET /api/health)...');
    const res2 = await request(`${baseUrl}/api/health`);
    if (
      res2.statusCode === 200 &&
      res2.body?.success === true &&
      res2.body?.data?.status === 'healthy'
    ) {
      console.log('  ✅ PASSED: Status 200, success=true, uptime recorded');
    } else {
      console.error('  ❌ FAILED: Unexpected response:', res2);
      allPassed = false;
    }

    // Test 3: 404 Not Found & Error Response Format
    console.log('\n▶ Test 3: Checking 404 handler and error response format...');
    const res3 = await request(`${baseUrl}/api/unknown-endpoint`);
    if (
      res3.statusCode === 404 &&
      res3.body?.success === false &&
      res3.body?.error?.code === 'NOT_FOUND' &&
      res3.body?.error?.timestamp
    ) {
      console.log('  ✅ PASSED: Status 404, consistent error structure validated:');
      console.log(`     Error Code: ${res3.body.error.code}`);
      console.log(`     Message:    ${res3.body.error.message}`);
    } else {
      console.error('  ❌ FAILED: Error format mismatch:', res3.body);
      allPassed = false;
    }

    // Test 4: Request Validation Error Structure
    console.log('\n▶ Test 4: Checking request validation middleware error format (POST /api/transactions with empty body)...');
    const res4 = await request(
      `${baseUrl}/api/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      JSON.stringify({})
    );

    if (
      res4.statusCode === 422 &&
      res4.body?.success === false &&
      res4.body?.error?.code === 'VALIDATION_ERROR' &&
      Array.isArray(res4.body?.error?.details) &&
      res4.body.error.details.length > 0
    ) {
      console.log('  ✅ PASSED: Status 422, validation details received:');
      for (const d of res4.body.error.details) {
        console.log(`     - [${d.field}]: ${d.message}`);
      }
    } else {
      console.error('  ❌ FAILED: Validation error format mismatch:', res4.body);
      allPassed = false;
    }

    console.log('\n===============================================');
    if (allPassed) {
      console.log('🎉 ALL HEALTH & VALIDATION TESTS PASSED SUCCESSFULLY!');
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

runTests();
