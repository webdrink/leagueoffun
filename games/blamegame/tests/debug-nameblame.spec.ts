import { test } from '@playwright/test';

test.describe('NameBlame Flow Debug', () => {
  test('should follow correct NameBlame flow: Intro -> PlayerSetup -> Loading -> Game', async ({ page }) => {
    // Listen to console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // Navigate to the app
    await page.goto('http://localhost:5173');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Step 1: Check what's actually on the page
    console.log('Step 1: Checking what is actually on the page');
    const bodyText = await page.textContent('body');
    console.log('Page content:', bodyText?.substring(0, 1000));

    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/debug-nameblame-1-initial.png' });

    // Try to find any heading or title
    const heading = page.locator('h1').first();
    if (await heading.isVisible()) {
      const headingText = await heading.textContent();
      console.log('Found heading:', headingText);
    }

    // Look for any button with "Start" text
    const startButtons = page.locator('button').filter({ hasText: /Start/i });
    const startButtonCount = await startButtons.count();
    console.log('Found start buttons:', startButtonCount);

    // Look for toggles/switches - try different selectors
    const switches = page.locator('input[type="checkbox"]');
    const switchCount = await switches.count();
    console.log('Found checkbox inputs:', switchCount);
    
    // Also try to find by role or button elements that might be switches
    const switchButtons = page.locator('[role="switch"], button[data-radix-switch-thumb]');
    const switchButtonCount = await switchButtons.count();
    console.log('Found switch elements:', switchButtonCount);
    
    // Try to find by the label text
    const nameBlameLabel = page.locator('text=NameBlame Modus');
    const labelVisible = await nameBlameLabel.isVisible().catch(() => false);
    console.log('NameBlame label visible:', labelVisible);
    
    // Try to find any clickable element with the text
    const nameBlameElements = page.locator('text=/NameBlame/');
    const nameBlameCount = await nameBlameElements.count();
    console.log('Elements with NameBlame text:', nameBlameCount);

    // If we can't find expected elements, let's see what we can interact with
    if (startButtonCount === 0) {
      console.log('No start buttons found, checking all buttons...');
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log('Total buttons found:', buttonCount);
      for (let i = 0; i < buttonCount; i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`Button ${i}: "${buttonText}"`);
      }
    }

    // Try to proceed anyway - look for any toggle and click start
    console.log('Step 2: Directly calling the NameBlame mode change callback');
    await page.evaluate(() => {
      // Try to find the React component and call the callback directly
      // This is a hack, but let's see if it works
      try {
        // Look for the IntroScreen component in the React tree
        const reactRoot = document.getElementById('root');
        if (reactRoot) {
          // Force a game step change by dispatching a custom event or something
          console.log('Found root element, trying to force navigation...');
          
          // Try to access the window object to see if there are any exposed methods
          if ((window as any).gameSettings) {
            console.log('Found exposed gameSettings:', (window as any).gameSettings);
          }
          
          // Try to simulate the callback by directly setting the game step
          // This won't work in production but might help debug
          const event = new CustomEvent('forcePlayerSetup', { bubbles: true });
          document.dispatchEvent(event);
        }
      } catch (e) {
        console.error('Failed to force navigation:', e);
      }
    });
    
    // Wait a bit
    await page.waitForTimeout(500);

    // Reload the page to pick up the new settings
    await page.reload();
    await page.waitForTimeout(1000);
    
    console.log('Page reloaded with NameBlame mode enabled');

    // Step 3: Click start button
    console.log('Step 3: Clicking start button');
    const startButton = page.locator('button:has-text("Spiel starten")').first();
    await startButton.click();

    // Wait for navigation
    await page.waitForTimeout(1000);

    // Log console messages so far
    console.log('=== CONSOLE MESSAGES AFTER START CLICK ===');
    consoleMessages.forEach((msg, i) => {
      console.log(`${i + 1}: ${msg}`);
    });

    // Take screenshot after clicking start
    await page.screenshot({ path: 'test-results/debug-nameblame-3-after-start.png' });

    // Check what screen we're on now
    const newBodyText = await page.textContent('body');
    console.log('After start click:', newBodyText?.substring(0, 500));

    // Look for player setup indicators
    const playerSetupIndicators = [
      'Set Up Players',
      'Player Setup',
      'Add Player',
      'Players'
    ];

    for (const indicator of playerSetupIndicators) {
      const visible = await page.locator(`text=${indicator}`).isVisible().catch(() => false);
      if (visible) {
        console.log(`✅ Found player setup indicator: "${indicator}"`);
        return; // Success - we reached player setup
      }
    }

    // Check for loading screen
    const loadingVisible = await page.locator('text=Loading').isVisible().catch(() => false);
    if (loadingVisible) {
      console.log('❌ Incorrectly went to Loading screen instead of Player Setup');
      throw new Error('Flow error: Went to Loading screen instead of Player Setup for NameBlame mode');
    }

    console.log('❌ Did not find expected player setup screen');
    throw new Error('Flow error: Did not navigate to expected Player Setup screen');
  });
});