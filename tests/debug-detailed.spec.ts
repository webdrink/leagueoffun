import { test, expect } from '@playwright/test';

test.describe('BlameGame - Detailed Debugging', () => {
  test('should debug the loading process step by step', async ({ page }) => {
    // Monitor console logs
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(3000);
    
    console.log('=== INITIAL STATE ===');
    console.log('Page title:', await page.title());
    console.log('Initial body text:', await page.textContent('body'));
    
    // Find and click start button
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    console.log('Start button found');
    
    // Click start and monitor what happens
    await startButton.click();
    console.log('Start button clicked');
    
    // Wait and check states at different intervals
    for (let i = 1; i <= 10; i++) {
      await page.waitForTimeout(1000);
      const bodyText = await page.textContent('body');
      console.log(`=== ${i} seconds after click ===`);
      console.log(`Body text length: ${bodyText?.length}`);
      console.log(`Body preview: ${bodyText?.slice(0, 200)}...`);
      
      // Check if we've progressed to a game screen
      const hasQuestion = bodyText?.includes('Frage') || bodyText?.includes('Question');
      const hasBlame = bodyText?.includes('Schuld') || bodyText?.includes('Blame');
      const hasNext = bodyText?.includes('Weiter') || bodyText?.includes('Next');
      
      console.log(`Game indicators - Question: ${hasQuestion}, Blame: ${hasBlame}, Next: ${hasNext}`);
      
      if (hasQuestion || hasBlame || hasNext) {
        console.log('🎉 Game has progressed beyond loading!');
        break;
      }
      
      // Check for any error messages
      const hasError = bodyText?.includes('error') || bodyText?.includes('Error') || bodyText?.includes('Fehler');
      if (hasError) {
        console.log('⚠️ Error detected in page content');
      }
    }
    
    console.log('=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'debug-detailed-flow.png', fullPage: true });
  });

  test('should test if game progresses after extended wait', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    
    console.log('Waiting 15 seconds to see if game progresses...');
    await page.waitForTimeout(15000);
    
    const finalContent = await page.textContent('body');
    console.log('Final content after 15s:', finalContent?.slice(0, 500));
    
    // Check if we have actual game elements
    const gameElements = await page.locator('[data-testid*="game"], .question, .game-header, .progress').count();
    console.log('Game elements found:', gameElements);
    
    // Look for specific game text
    const hasGameContent = await page.getByText(/frage.*von|question.*of|weiter|next|zurück|back/i).count();
    console.log('Game content elements:', hasGameContent);
  });
});
