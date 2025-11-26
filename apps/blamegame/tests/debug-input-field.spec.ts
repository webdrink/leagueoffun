import { test } from '@playwright/test';

test.describe('NameBlame Player Setup Debug', () => {
  test('debug player input field behavior step by step', async ({ page }) => {
    // Enable browser console logging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`🌐 BROWSER: ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:999');
    
    // Navigate to intro and check all elements
    console.log('🎯 Step 1: Checking intro screen elements');
    
    // Debug: Let's see all the elements on the page
    const allButtons = await page.locator('button').count();
    console.log(`🔢 Total buttons: ${allButtons}`);
    
    const allSwitches = await page.locator('[role="switch"]').count();
    console.log(`🔢 Total switches: ${allSwitches}`);
    
    const allInputs = await page.locator('input').count();
    console.log(`🔢 Total inputs: ${allInputs}`);
    
    const allLabels = await page.locator('label').count();
    console.log(`🔢 Total labels: ${allLabels}`);
    
    // Look for any text containing "Blame"
    const blameText = await page.locator(':has-text("Blame")').count();
    console.log(`📝 Text containing "Blame": ${blameText}`);
    
    // Look for the specific nameBlame toggle
    const nameBlameSwitchCount = await page.locator('#nameBlameModeToggle').count();
    console.log(`📝 NameBlame switches found: ${nameBlameSwitchCount}`);
    
    // Try different selectors
    const switchByRole = await page.locator('[role="switch"]').count();
    console.log(`📝 Switches by role: ${switchByRole}`);
    
    // Get page content to see what's actually there
    const pageText = await page.textContent('body');
    console.log(`📄 Page contains nameBlame text: ${pageText?.includes('NameBlame') || pageText?.includes('Blame')}`);
    
    if (switchByRole > 0) {
      console.log('🎯 Step 2: Found switches, trying to enable nameBlame mode');
      // Click the first switch (assuming it's nameBlame)
      await page.click('[role="switch"]');
      await page.waitForTimeout(500);
      
      console.log('🎯 Step 3: Start game with nameBlame mode enabled');
      await page.click('button:has-text("Spiel starten")');
      
      // Wait for player setup screen to appear
      try {
        await page.waitForSelector('text=Spieler-Setup', { timeout: 10000 });
        console.log('✅ Player setup screen loaded for nameBlame mode');
      } catch (error) {
        console.log('❌ Player setup screen not found, checking what screen appeared');
        const currentText = await page.textContent('body');
        console.log(`📄 Current content: ${currentText?.slice(0, 300)}...`);
        return;
      }
    } else {
      console.log('❌ No switches found on intro screen');
      return;
    }
    
    // Debug: Check initial state
    console.log('🔍 Initial state check...');
    const inputExists1 = await page.locator('input[placeholder="Spielername"]').count();
    console.log(`📝 Input field count: ${inputExists1}`);
    
    const inputValue1 = inputExists1 > 0 ? await page.locator('input[placeholder="Spielername"]').inputValue() : 'N/A';
    console.log(`📝 Input field value: "${inputValue1}"`);
    
    const playerListCount1 = await page.locator('.space-y-3 .flex.items-center.justify-between').count();
    console.log(`👥 Current players count: ${playerListCount1}`);
    
    if (inputExists1 === 0) {
      console.log('❌ No input field found - nameBlame player setup may not be working');
      return;
    }
    
    // Add first player
    console.log('🎯 Step 4: Add first player');
    await page.fill('input[placeholder="Spielername"]', 'TestPlayer1');
    
    const filledValue = await page.locator('input[placeholder="Spielername"]').inputValue();
    console.log(`📝 After fill - Input value: "${filledValue}"`);
    
    await page.click('button[type="submit"]');
    console.log('✅ Clicked add button for first player');
    
    // Wait a moment for state update
    await page.waitForTimeout(1000);
    
    // Debug: Check state after first player
    console.log('🔍 State after first player...');
    const inputExists2 = await page.locator('input[placeholder="Spielername"]').count();
    console.log(`📝 Input field count after add: ${inputExists2}`);
    
    if (inputExists2 > 0) {
      const inputValue2 = await page.locator('input[placeholder="Spielername"]').inputValue();
      console.log(`📝 Input field value after add: "${inputValue2}"`);
      
      const isVisible = await page.locator('input[placeholder="Spielername"]').isVisible();
      console.log(`👁️ Input field visible: ${isVisible}`);
      
      const isDisabled = await page.locator('input[placeholder="Spielername"]').isDisabled();
      console.log(`🚫 Input field disabled: ${isDisabled}`);
    } else {
      console.log('❌ Input field no longer exists!');
      
      // Check if form still exists
      const formExists = await page.locator('form').count();
      console.log(`📋 Form count: ${formExists}`);
      
      // Check what elements are in the container
      const allInputsAfter = await page.locator('input').count();
      console.log(`🔢 Total inputs on page: ${allInputsAfter}`);
      
      // Get all input types and placeholders
      const inputs = await page.locator('input').all();
      for (let i = 0; i < inputs.length; i++) {
        const type = await inputs[i].getAttribute('type');
        const placeholder = await inputs[i].getAttribute('placeholder');
        const value = await inputs[i].inputValue();
        console.log(`   Input ${i}: type="${type}", placeholder="${placeholder}", value="${value}"`);
      }
    }
    
    const playerListCount2 = await page.locator('.space-y-3 .flex.items-center.justify-between').count();
    console.log(`👥 Players count after add: ${playerListCount2}`);
    
    // List all players
    const players = await page.locator('.space-y-3 .flex.items-center.justify-between span').allTextContents();
    console.log(`👥 Player names: ${JSON.stringify(players)}`);
    
    // Try to add second player (this should work now if the infinite loop is fixed)
    console.log('🎯 Step 5: Attempt to add second player');
    
    if (inputExists2 > 0) {
      try {
        await page.fill('input[placeholder="Spielername"]', 'TestPlayer2');
        await page.click('button[type="submit"]');
        console.log('✅ Successfully added second player');
        
        // Check final state
        const finalPlayerCount = await page.locator('.space-y-3 .flex.items-center.justify-between').count();
        console.log(`👥 Final players count: ${finalPlayerCount}`);
        
        // List final players
        const finalPlayers = await page.locator('.space-y-3 .flex.items-center.justify-between span').allTextContents();
        console.log(`👥 Final player names: ${JSON.stringify(finalPlayers)}`);
        
        // Test the "Start Game" button
        const startButton = await page.locator('button:has-text("Spiel starten")').count();
        console.log(`🎮 Start game button available: ${startButton > 0}`);
        
        if (startButton > 0) {
          const isStartButtonEnabled = await page.locator('button:has-text("Spiel starten")').isEnabled();
          console.log(`🎮 Start game button enabled: ${isStartButtonEnabled}`);
        }
        
      } catch (error: unknown) {
        console.log(`❌ Failed to add second player: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      console.log('❌ Cannot add second player - input field missing');
    }
  });
});
