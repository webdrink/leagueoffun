import { test, expect } from '@playwright/test';

test('network requests debug', async ({ page }) => {
  console.log('=== NETWORK DEBUG ===');
  
  // Monitor network requests
  const requests: string[] = [];
  const responses: { url: string; status: number; statusText: string }[] = [];
  
  page.on('request', request => {
    if (request.url().includes('questions') || request.url().includes('categories')) {
      requests.push(`REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('questions') || response.url().includes('categories')) {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  console.log('Starting page load...');
  await page.goto('/');
  
  // Wait for questions to load
  await page.waitForTimeout(10000);
  
  console.log('=== REQUESTS ===');
  requests.forEach(req => console.log(req));
  
  console.log('=== RESPONSES ===');
  responses.forEach(resp => console.log(`RESPONSE: ${resp.status} ${resp.statusText} - ${resp.url}`));
  
  // Check what's in the window
  const windowData = await page.evaluate(() => {
    return {
      questionsLength: (window as any).gameQuestions?.length || 0,
      categoriesLength: (window as any).gameCategories?.length || 0,
      questionsFirstItem: (window as any).gameQuestions?.[0] || null
    };
  });
  
  console.log('Window data:', windowData);
  
  expect(requests.length).toBeGreaterThan(0);
});
