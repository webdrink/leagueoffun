import { test } from '@playwright/test';

test.describe('BlameGame - Simple NameBlame Test', () => {
  test('should debug nameBlame mode step by step', async ({ page }) => {
    const logs: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('🎯') || text.includes('❌') || text.includes('🔄')) {
        logs.push(text);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    console.log('Step 1: Enable nameBlame mode');
    const nameBlameModeToggle = page.getByRole('switch').first();
    const isChecked = await nameBlameModeToggle.isChecked().catch(() => false);
    console.log(`NameBlame mode initially checked: ${isChecked}`);
    
    if (!isChecked) {
      await nameBlameModeToggle.click();
      await page.waitForTimeout(1000);
      const newCheckedState = await nameBlameModeToggle.isChecked().catch(() => false);
      console.log(`After click, nameBlame mode checked: ${newCheckedState}`);
    }

    console.log('Step 2: Click start button');
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(3000);

    console.log('Step 3: Check what screen we\'re on');
    const bodyContent = await page.textContent('body');
    console.log(`Body content: ${bodyContent?.slice(0, 200)}...`);

    // Check for player setup screen
    const setupScreenVisible = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible().catch(() => false);
    console.log(`Player setup screen visible: ${setupScreenVisible}`);

    if (setupScreenVisible) {
      console.log('Step 4: Look for player input');
      
      // Try different input selectors
      const inputSelectors = [
        'input[placeholder*="Spielername"]',
        'input[placeholder*="spieler"]', 
        'input[placeholder*="name"]',
        'input[type="text"]'
      ];
      
      for (const selector of inputSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          const placeholder = await page.locator(selector).first().getAttribute('placeholder');
          console.log(`Found ${count} inputs with selector "${selector}", placeholder: "${placeholder}"`);
        }
      }
      
      // Try using the exact placeholder
      const exactInput = page.getByPlaceholder('Spielername');
      const exactInputExists = await exactInput.count() > 0;
      console.log(`Input with placeholder "Spielername" exists: ${exactInputExists}`);
      
      if (exactInputExists) {
        console.log('Step 5: Add players using exact placeholder');
        
        // Add first player
        await exactInput.fill('TestPlayer1');
        console.log('Filled first player name');
        
        // Find add button
        const addButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
        await addButton.click();
        console.log('Clicked add button for first player');
        await page.waitForTimeout(1000);
        
        // Add second player
        await exactInput.fill('TestPlayer2');
        await addButton.click();
        console.log('Added second player');
        await page.waitForTimeout(1000);
        
        // Check if start game button is enabled
        const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
        const isEnabled = await startGameButton.isEnabled().catch(() => false);
        console.log(`Start game button enabled: ${isEnabled}`);
        
        if (isEnabled) {
          console.log('Step 6: Start the actual game');
          await startGameButton.click();
          await page.waitForTimeout(4000);
          
          console.log('Step 7: Check if we reached the game screen');
          const finalContent = await page.textContent('body');
          console.log(`Final content: ${finalContent?.slice(0, 300)}...`);
          
          // Check for game indicators
          const progressVisible = await page.getByText(/Frage.*\d+.*von.*\d+/i).isVisible().catch(() => false);
          console.log(`Progress indicator visible: ${progressVisible}`);
          
          if (progressVisible) {
            console.log('✅ Successfully reached nameBlame game screen!');
            
            // Look for player buttons
            const player1Button = page.getByRole('button', { name: 'TestPlayer1' });
            const player2Button = page.getByRole('button', { name: 'TestPlayer2' });
            
            const player1Exists = await player1Button.count() > 0;
            const player2Exists = await player2Button.count() > 0;
            
            console.log(`Player buttons - TestPlayer1: ${player1Exists}, TestPlayer2: ${player2Exists}`);
            
            if (player1Exists && player2Exists) {
              const player1Disabled = await player1Button.isDisabled().catch(() => false);
              const player2Disabled = await player2Button.isDisabled().catch(() => false);
              
              console.log(`Player1 disabled: ${player1Disabled}, Player2 disabled: ${player2Disabled}`);
              
              // Try clicking the enabled button
              if (!player1Disabled) {
                await player1Button.click();
                console.log('Clicked TestPlayer1 button');
              } else if (!player2Disabled) {
                await player2Button.click();
                console.log('Clicked TestPlayer2 button');
              }
              
              await page.waitForTimeout(2000);
              
              // Check if turn switched
              const newPlayer1Disabled = await player1Button.isDisabled().catch(() => false);
              const newPlayer2Disabled = await player2Button.isDisabled().catch(() => false);
              
              console.log(`After click - Player1 disabled: ${newPlayer1Disabled}, Player2 disabled: ${newPlayer2Disabled}`);
            }
          }
        }
      }
    }
    
    console.log('=== CONSOLE LOGS ===');
    logs.forEach(log => console.log(log));
    
    await page.screenshot({ path: 'nameblame-debug.png', fullPage: true });
  });
});
