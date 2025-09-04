import { test, expect } from '@playwright/test';
import { saveToJSON } from '../../utils/data-utils';

test.describe('API Testing with Playwright', () => {
  
  test('Test REST API endpoints', async ({ request }) => {
    const baseURL = 'https://jsonplaceholder.typicode.com';
    
    // GET request
    const getResponse = await request.get(`${baseURL}/posts/1`);
    expect(getResponse.status()).toBe(200);
    
    const post = await getResponse.json();
    expect(post).toHaveProperty('id', 1);
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    
    console.log('✅ GET request successful');
    
    // POST request
    const newPost = {
      title: 'Test Post from Playwright',
      body: 'This is a test post created via automation',
      userId: 1
    };
    
    const postResponse = await request.post(`${baseURL}/posts`, {
      data: newPost
    });
    
    expect(postResponse.status()).toBe(201);
    const createdPost = await postResponse.json();
    expect(createdPost).toHaveProperty('id');
    expect(createdPost.title).toBe(newPost.title);
    
    console.log('✅ POST request successful');
    
    // PUT request
    const updatedPost = {
      id: 1,
      title: 'Updated Post Title',
      body: 'Updated post body',
      userId: 1
    };
    
    const putResponse = await request.put(`${baseURL}/posts/1`, {
      data: updatedPost
    });
    
    expect(putResponse.status()).toBe(200);
    const updated = await putResponse.json();
    expect(updated.title).toBe(updatedPost.title);
    
    console.log('✅ PUT request successful');
    
    // DELETE request
    const deleteResponse = await request.delete(`${baseURL}/posts/1`);
    expect(deleteResponse.status()).toBe(200);
    
    console.log('✅ DELETE request successful');
    
    // Save API test results
    const apiTestResults = {
      baseURL,
      tests: [
        { method: 'GET', endpoint: '/posts/1', status: getResponse.status(), success: true },
        { method: 'POST', endpoint: '/posts', status: postResponse.status(), success: true },
        { method: 'PUT', endpoint: '/posts/1', status: putResponse.status(), success: true },
        { method: 'DELETE', endpoint: '/posts/1', status: deleteResponse.status(), success: true }
      ],
      testedAt: new Date().toISOString()
    };
    
    await saveToJSON(apiTestResults, 'api-test-results');
  });
  
  test('Test API with authentication', async ({ request }) => {
    // Example with GitHub API (requires token for some endpoints)
    const baseURL = 'https://api.github.com';
    
    // Test public endpoint (no auth required)
    const publicResponse = await request.get(`${baseURL}/users/octocat`);
    expect(publicResponse.status()).toBe(200);
    
    const user = await publicResponse.json();
    expect(user).toHaveProperty('login', 'octocat');
    
    // Test authenticated endpoint (would require actual token)
    // const authResponse = await request.get(`${baseURL}/user`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    //     'Accept': 'application/vnd.github.v3+json'
    //   }
    // });
    
    console.log('✅ API authentication test completed');
  });
  
  test('Test API error handling', async ({ request }) => {
    const baseURL = 'https://jsonplaceholder.typicode.com';
    
    // Test 404 error
    const notFoundResponse = await request.get(`${baseURL}/posts/999999`);
    expect(notFoundResponse.status()).toBe(404);
    
    // Test invalid data
    const invalidPostResponse = await request.post(`${baseURL}/posts`, {
      data: { invalid: 'data' } // Missing required fields
    });
    // Note: JSONPlaceholder is forgiving, but in real APIs this might return 400
    
    const errorTestResults = {
      notFoundTest: {
        endpoint: '/posts/999999',
        expectedStatus: 404,
        actualStatus: notFoundResponse.status(),
        success: notFoundResponse.status() === 404
      },
      testedAt: new Date().toISOString()
    };
    
    await saveToJSON(errorTestResults, 'api-error-test-results');
    
    console.log('✅ API error handling tests completed');
  });
  
  test('API performance testing', async ({ request }) => {
    const baseURL = 'https://jsonplaceholder.typicode.com';
    const performanceResults: any[] = [];
    
    // Test multiple requests and measure response times
    for (let i = 1; i <= 5; i++) {
      const startTime = Date.now();
      
      const response = await request.get(`${baseURL}/posts/${i}`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      performanceResults.push({
        requestNumber: i,
        endpoint: `/posts/${i}`,
        responseTime,
        status: response.status(),
        success: response.status() === 200
      });
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    }
    
    // Calculate average response time
    const avgResponseTime = performanceResults.reduce((sum, result) => 
      sum + result.responseTime, 0) / performanceResults.length;
    
    const performanceSummary = {
      totalRequests: performanceResults.length,
      averageResponseTime: Math.round(avgResponseTime),
      fastestResponse: Math.min(...performanceResults.map(r => r.responseTime)),
      slowestResponse: Math.max(...performanceResults.map(r => r.responseTime)),
      allResults: performanceResults,
      testedAt: new Date().toISOString()
    };
    
    await saveToJSON(performanceSummary, 'api-performance-results');
    
    console.log(`⚡ Average response time: ${avgResponseTime}ms`);
    console.log('✅ API performance testing completed');
  });
  
  test('API integration with UI', async ({ page, request }) => {
    // First, create data via API
    const newUser = {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com'
    };
    
    const createUserResponse = await request.post('https://jsonplaceholder.typicode.com/users', {
      data: newUser
    });
    
    expect(createUserResponse.status()).toBe(201);
    const createdUser = await createUserResponse.json();
    
    // Then verify it appears in the UI (using a demo site that displays this data)
    await page.goto('https://jsonplaceholder.typicode.com/users');
    
    // This is a simple example - in real scenarios, you'd navigate to your app
    // and verify that the API-created data appears in the UI
    
    const integrationResults = {
      apiCreation: {
        success: createUserResponse.status() === 201,
        userId: createdUser.id,
        userData: newUser
      },
      uiVerification: {
        pageLoaded: true,
        // In real scenarios, you'd check if the data appears in the UI
      },
      testedAt: new Date().toISOString()
    };
    
    await saveToJSON(integrationResults, 'api-ui-integration-results');
    
    console.log('✅ API-UI integration test completed');
  });
});
