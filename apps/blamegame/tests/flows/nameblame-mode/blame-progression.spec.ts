/**
 * NameBlame Chain Progression Tests
 * 
 * Purpose: Test the simplified blame chain functionality where each question gets
 * exactly one blame action, and the blamed player becomes the next active player.
 * 
 * This test suite covers:
 * - Single blame per question (no multi-round accumulation)
 * - Reveal phase (blamed player reads question aloud)  
 * - Chain progression: blamed player becomes next active player
 * - Question advancement after reveal acknowledgement
 */

import { test, expect } from '@playwright/test';

test.describe('NameBlame Chain Progression Flow', () => {
  
  test('should follow blame chain: blame → reveal → next question with blamed player active', async ({ page }) => {
    console.log('🧪 Testing: NameBlame chain progression (single blame per question)');
    
    // Set up NameBlame game with 3 players
    await page.goto('/');
    
    // Enable NameBlame mode
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Navigate to player setup
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Add exactly 3 players
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    const players = ['Alice', 'Bob', 'Charlie'];
    for (const playerName of players) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
    }
    
    // Start the game
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Track console messages for debugging
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('NAMEBLAME CHAIN') || text.includes('REVEAL') || text.includes('blamed')) {
        consoleMessages.push(text);
      }
    });
    
    // Get initial question and active player info
    const initialQuestionText = await page.getByText(/frage.*\d+.*von|question.*\d+.*of/i).textContent();
    console.log('Q1:', initialQuestionText);
    
    // Step 1: First player (Alice) blames someone (Bob)
    console.log('🎯 Step 1: First player blames');
    const bobButton = page.getByRole('button', { name: /bob/i }).first();
    await expect(bobButton).toBeVisible();
    await bobButton.click();
    await page.waitForTimeout(2000);
    
    // Should now be in reveal phase - check for blame context display
    const blameContext = page.locator('.bg-autumn-100'); // blame context container
    await expect(blameContext).toBeVisible();
    console.log('✅ Reveal phase: blame context visible');
    
    // Should see "Next Blame" / "Continue" button (not player buttons)
    const nextBlameButton = page.getByRole('button', { name: /continue|next.*blame|weiter/i });
    await expect(nextBlameButton).toBeVisible();
    
    // Player buttons should be hidden in reveal phase
    const playerButtons = page.getByRole('button').filter({ hasText: /alice|charlie/i });
    await expect(playerButtons.first()).not.toBeVisible();
    console.log('✅ Player buttons hidden during reveal');
    
    // Step 2: Continue to next question (blamed player becomes active)
    await nextBlameButton.click();
    await page.waitForTimeout(3000);
    
    // Should advance to next question
    const newQuestionText = await page.getByText(/frage.*\d+.*von|question.*\d+.*of/i).textContent();
    expect(newQuestionText).not.toBe(initialQuestionText);
    console.log('Q2:', newQuestionText);
    console.log('✅ Advanced to next question after reveal');
    
    // Bob should now be the active player (since he was blamed)
    // We can verify this by checking that Bob cannot blame himself (disabled)
    const bobButtonNow = page.getByRole('button', { name: /bob/i }).first();
    await expect(bobButtonNow).toBeDisabled();
    console.log('✅ Bob is now active player (cannot blame self)');
    
    // Alice and Charlie should be available for Bob to blame
    const aliceButton = page.getByRole('button', { name: /alice/i }).first();
    const charlieButton = page.getByRole('button', { name: /charlie/i }).first();
    await expect(aliceButton).toBeEnabled();
    await expect(charlieButton).toBeEnabled();
    
    // Step 3: Bob blames Charlie to continue the chain
    console.log('🎯 Step 3: Bob blames Charlie');
    await charlieButton.click();
    await page.waitForTimeout(2000);
    
    // Should again be in reveal phase
    await expect(blameContext).toBeVisible();
    
    // Continue to next question
    const nextBlameButton2 = page.getByRole('button', { name: /continue|next.*blame|weiter/i });
    await nextBlameButton2.click();
    await page.waitForTimeout(3000);
    
    // Should advance to Q3
    const thirdQuestionText = await page.getByText(/frage.*\d+.*von|question.*\d+.*of/i).textContent();
    expect(thirdQuestionText).not.toBe(newQuestionText);
    console.log('Q3:', thirdQuestionText);
    
    // Charlie should now be active (cannot blame self)
    const charlieButtonNow = page.getByRole('button', { name: /charlie/i }).first();
    await expect(charlieButtonNow).toBeDisabled();
    console.log('✅ Charlie is now active player after being blamed');
    
    // Log console messages for debugging
    console.log('📝 Console chain messages:');
    consoleMessages.slice(-5).forEach(msg => console.log('  -', msg));
    
    console.log('🎉 NameBlame chain progression test completed successfully');
  });
  
  test('should display proper blame context in reveal phase', async ({ page }) => {
    console.log('🧪 Testing: Reveal phase blame context display');
    
    // Quick setup
    await page.goto('/');
    
    // Enable NameBlame and setup 3 players
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(500);
      }
    }
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    const players = ['Player1', 'Player2', 'Player3'];
    for (const playerName of players) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(200);
    }
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Get question text before blame
    const _questionText = await page.locator('.question-text, .text-center').first().textContent();
    
    // First blame
    const player2Button = page.getByRole('button', { name: /player2/i }).first();
    await player2Button.click();
    await page.waitForTimeout(1500);
    
    // Check blame context shows correctly
    const blameContext = page.locator('.bg-autumn-100');
    await expect(blameContext).toBeVisible();
    
    // Should contain blame information
    const contextText = await blameContext.textContent();
    expect(contextText).toContain('Player1'); // blamer
    expect(contextText).toContain('Player2'); // blamed
    console.log('✅ Blame context displays blamer and blamed correctly');
    
    // Should show "Continue to next question" since it's single blame per question
    const continueButton = page.getByRole('button', { name: /continue.*question|weiter.*frage/i });
    await expect(continueButton).toBeVisible();
    console.log('✅ Continue button shows "next question" label');
    
    console.log('🎉 Reveal phase display test completed successfully');
  });
  
});
