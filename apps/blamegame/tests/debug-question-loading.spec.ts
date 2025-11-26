import { test, expect } from '@playwright/test';

test.describe('Debug Question Loading', () => {
  test('check if dev server is accessible', async ({ page }) => {
    console.log('=== DEBUGGING QUESTION LOADING ===');
    
    // Go to the app (check the correct port since dev server is on 5174)
    await page.goto('http://localhost:5174/');
    
    // Check basic page loading
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if categories.json is accessible
    const categoriesResponse = await page.goto('http://localhost:5174/questions/categories.json');
    const categoriesStatus = categoriesResponse?.status();
    console.log('Categories status:', categoriesStatus);
    
    if (categoriesStatus === 200) {
      const categoriesText = await categoriesResponse?.text();
      console.log('Categories content preview:', categoriesText?.substring(0, 200));
    }
    
    // Check if a specific question file is accessible
    const questionsResponse = await page.goto('http://localhost:5174/questions/de/alex.json');
    const questionsStatus = questionsResponse?.status();
    console.log('Questions status:', questionsStatus);
    
    if (questionsStatus === 200) {
      const questionsText = await questionsResponse?.text();
      console.log('Questions content preview:', questionsText?.substring(0, 200));
    }
    
    // Now go back to the app and check what actually happens
    await page.goto('http://localhost:5174/');
    
    // Wait a bit for the app to initialize
    await page.waitForTimeout(2000);
    
    // Check console errors
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Check what's happening in the browser console
    const jsErrors = await page.evaluate(() => {
      const errors: string[] = [];
      
      // Check if window.gameQuestions exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gameQuestions = (window as any).gameQuestions;
      errors.push(`window.gameQuestions exists: ${!!gameQuestions}`);
      errors.push(`window.gameQuestions length: ${gameQuestions?.length || 0}`);
      
      // Check if there are any categories loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gameCategories = (window as any).gameCategories;
      errors.push(`window.gameCategories exists: ${!!gameCategories}`);
      errors.push(`window.gameCategories length: ${gameCategories?.length || 0}`);
      
      return errors;
    });
    
    console.log('Browser state:', jsErrors);
    console.log('Console logs:', logs);
    
    // Take a screenshot to see what the user sees
    await page.screenshot({ path: 'debug-question-loading.png' });
    
    expect(categoriesStatus).toBe(200);
    expect(questionsStatus).toBe(200);
  });
});
