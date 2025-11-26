import { test, expect } from '@playwright/test';

test('simple question loading debug', async ({ page }) => {
  console.log('=== SIMPLE QUESTION DEBUG ===');
  
  await page.goto('/');
  
  // Wait longer for the app to fully initialize
  await page.waitForTimeout(5000);
  
  // Check what's actually in window.gameQuestions
  const gameState = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = (window as any).gameQuestions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories = (window as any).gameCategories;
    
    return {
      questionsExists: !!questions,
      questionsCount: questions ? questions.length : 0,
      questionsPreview: questions ? questions.slice(0, 3) : [],
      categoriesExists: !!categories,
      categoriesCount: categories ? categories.length : 0,
      categoriesPreview: categories ? categories.slice(0, 3) : []
    };
  });
  
  console.log('Game state:', JSON.stringify(gameState, null, 2));
  
  // Check console logs for any clues about loading
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // Refresh to capture console logs from start
  await page.reload();
  await page.waitForTimeout(5000);
  
  console.log('Console logs:', consoleLogs);
  
  expect(gameState.questionsExists).toBe(true);
});
