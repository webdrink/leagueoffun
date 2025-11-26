import { test, expect } from '@playwright/test';

test.describe('BlameGame - Debug Current State', () => {
  test('should debug classic mode game state', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    console.log('=== INITIAL PAGE STATE ===');
    const initialContent = await page.textContent('body');
    console.log('Initial content:', initialContent?.slice(0, 500));
    
    // Start the game
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    await page.waitForTimeout(5000);
    
    console.log('=== AFTER CLICKING START ===');
    const gameContent = await page.textContent('body');
    console.log('Game content:', gameContent?.slice(0, 800));
    
    // Check for any question-related elements
    const questionSelectors = [
      '.question',
      '[data-testid="question"]',
      '.question-card',
      '.question-text',
      '[class*="question"]',
      '.progress',
      '[data-testid="progress"]',
      '[class*="progress"]'
    ];
    
    console.log('=== SEARCHING FOR QUESTION ELEMENTS ===');
    for (const selector of questionSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const text = await page.locator(selector).first().textContent();
        console.log(`Found ${count} elements with "${selector}": "${text?.slice(0, 100)}..."`);
      } else {
        console.log(`No elements found with "${selector}"`);
      }
    }
    
    // Check for buttons
    console.log('=== SEARCHING FOR BUTTONS ===');
    const allButtons = page.getByRole('button');
    const buttonCount = await allButtons.count();
    console.log(`Found ${buttonCount} buttons:`);
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const buttonText = await allButtons.nth(i).textContent();
      const isVisible = await allButtons.nth(i).isVisible();
      console.log(`Button ${i}: "${buttonText}" (visible: ${isVisible})`);
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-classic-game-state.png', fullPage: true });
  });

  test('should debug nameBlame mode game state', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    console.log('=== NAMEBLAME MODE SETUP ===');
    
    // Try to find and enable nameBlame mode
    const switches = page.getByRole('switch');
    const checkboxes = page.getByRole('checkbox');
    const nameBlameText = page.getByText(/name.*blame/i);
    
    console.log(`Found ${await switches.count()} switches`);
    console.log(`Found ${await checkboxes.count()} checkboxes`);
    console.log(`Found ${await nameBlameText.count()} nameBlame text elements`);
    
    // Try to enable nameBlame mode
    let _nameBlameModeEnabled = false;
    
    if (await switches.count() > 0) {
      console.log('Trying switch...');
      const switchElement = switches.first();
      const isChecked = await switchElement.isChecked().catch(() => false);
      console.log(`Switch checked state: ${isChecked}`);
      
      if (!isChecked) {
        await switchElement.click();
        await page.waitForTimeout(1000);
        const newCheckedState = await switchElement.isChecked().catch(() => false);
        console.log(`After click, switch checked state: ${newCheckedState}`);
        _nameBlameModeEnabled = newCheckedState;
      } else {
        _nameBlameModeEnabled = true;
      }
    }
    
    // Start the game
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(3000);
    
    console.log('=== AFTER STARTING NAMEBLAME GAME ===');
    const content = await page.textContent('body');
    console.log('Content after start:', content?.slice(0, 800));
    
    // Look for player input
    const playerInputs = page.getByPlaceholder(/name|player|spieler/i);
    const inputCount = await playerInputs.count();
    console.log(`Found ${inputCount} player inputs`);
    
    if (inputCount > 0) {
      console.log('Adding test players...');
      await playerInputs.first().fill('TestPlayer1');
      
      const addButtons = page.getByRole('button', { name: /add|hinzufügen/i });
      if (await addButtons.count() > 0) {
        await addButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Add second player
        if (await playerInputs.count() > 0) {
          await playerInputs.first().fill('TestPlayer2');
          await addButtons.first().click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Try to continue
      const continueButtons = page.getByRole('button', { name: /start|continue|weiter/i });
      console.log(`Found ${await continueButtons.count()} continue buttons`);
      
      if (await continueButtons.count() > 0) {
        await continueButtons.first().click();
        await page.waitForTimeout(5000);
        
        console.log('=== NAMEBLAME GAME STARTED ===');
        const gameContent = await page.textContent('body');
        console.log('Game content:', gameContent?.slice(0, 800));
        
        // Check for player buttons
        const playerButtons = page.getByRole('button').filter({ hasText: /TestPlayer/i });
        const playerButtonCount = await playerButtons.count();
        console.log(`Found ${playerButtonCount} player blame buttons`);
        
        for (let i = 0; i < playerButtonCount; i++) {
          const button = playerButtons.nth(i);
          const text = await button.textContent();
          const isDisabled = await button.isDisabled();
          console.log(`Player button ${i}: "${text}" (disabled: ${isDisabled})`);
        }
      }
    }
    
    await page.screenshot({ path: 'debug-nameblame-game-state.png', fullPage: true });
  });
});
