/**
 * Focused Viewport Issues Diagnostic Test
 * 
 * Identifies specific remaining viewport/responsiveness problems
 */

import { test } from '@playwright/test';

test.describe('Remaining Viewport Issues Diagnostic', () => {
  
  test('Identify specific issues on very small mobile', async ({ page }) => {
    // Test on very small mobile (iPhone SE - older model)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('=== DIAGNOSTIC: Very Small Mobile (320x568) ===');
    
    // Navigate to category selection
    try {
      const categoryToggle = page.locator('text=Kategorien manuell wählen').first();
      if (await categoryToggle.isVisible()) {
        const toggle = page.locator('input[type="checkbox"]').filter({ 
          has: page.locator('text=Kategorien manuell wählen') 
        }).first();
        if (await toggle.isVisible()) {
          await toggle.check();
        }
      }
      
      const startButton = page.locator('button').filter({ 
        hasText: /Spiel starten|Start Game/ 
      }).first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('Could not navigate to category selection');
    }
    
    // Check if on category screen
    const categoryTitle = page.locator('text=Kategorien auswählen').first();
    if (await categoryTitle.isVisible()) {
      console.log('✓ Successfully on category selection screen');
      
      // Check main container
      const mainContainer = page.locator('.max-h-\\[calc\\(100vh-8rem\\)\\]').first();
      if (await mainContainer.isVisible()) {
        const containerBox = await mainContainer.boundingBox();
        if (containerBox) {
          console.log(`Container: ${containerBox.width}x${containerBox.height} at (${containerBox.x}, ${containerBox.y})`);
          
          // Check if container height exceeds viewport
          if (containerBox.y + containerBox.height > 568) {
            console.log('❌ ISSUE: Container extends below viewport');
          } else {
            console.log('✓ Container fits in viewport');
          }
        }
      }
      
      // Check category grid
      const categoryGrid = page.locator('.grid.grid-cols-2').first();
      if (await categoryGrid.isVisible()) {
        const gridBox = await categoryGrid.boundingBox();
        if (gridBox) {
          console.log(`Category grid: ${gridBox.width}x${gridBox.height}`);
          console.log(`Grid scrollable: ${gridBox.height > 200 ? 'Yes' : 'No'}`);
        }
      }
      
      // Check action buttons
      const backButton = page.locator('button:has-text("Zurück")').first();
      const startButton = page.locator('button:has-text("Mit 0 Kategorien starten")').first();
      
      const backBox = await backButton.boundingBox();
      const startBox = await startButton.boundingBox();
      
      if (backBox && startBox) {
        console.log(`Back button: ${backBox.width}x${backBox.height} at y=${backBox.y}`);
        console.log(`Start button: ${startBox.width}x${startBox.height} at y=${startBox.y}`);
        
        // Check if buttons are cut off
        if (backBox.y + backBox.height > 568 || startBox.y + startBox.height > 568) {
          console.log('❌ ISSUE: Action buttons cut off');
        } else {
          console.log('✓ Action buttons visible');
        }
      }
      
      // Check category cards
      const categoryCards = page.locator('.grid.grid-cols-2 > label');
      const cardCount = await categoryCards.count();
      console.log(`Total category cards: ${cardCount}`);
      
      if (cardCount > 0) {
        const firstCard = categoryCards.first();
        const cardBox = await firstCard.boundingBox();
        if (cardBox) {
          console.log(`Card size: ${cardBox.width}x${cardBox.height}`);
          
          // Check touch target size
          if (cardBox.height < 44 || cardBox.width < 44) {
            console.log('❌ ISSUE: Card touch target too small');
          } else {
            console.log('✓ Card touch target adequate');
          }
        }
      }
    } else {
      console.log('❌ Not on category selection screen');
    }
    
    // Check overall scrollability
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Body height: ${bodyHeight}, Viewport: 568`);
    if (bodyHeight > 568) {
      console.log('✓ Page is scrollable');
      
      // Test scrolling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      
      const scrollY = await page.evaluate(() => window.scrollY);
      console.log(`Scrolled to: ${scrollY}`);
      
      if (scrollY > 0) {
        console.log('✓ Scrolling works');
      } else {
        console.log('❌ ISSUE: Scrolling not working');
      }
    } else {
      console.log('Page fits without scrolling');
    }
  });
  
  test('Check very short landscape mobile', async ({ page }) => {
    // Test on landscape mobile (very short height)
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('=== DIAGNOSTIC: Short Landscape (667x375) ===');
    
    // Same navigation logic
    try {
      const categoryToggle = page.locator('text=Kategorien manuell wählen').first();
      if (await categoryToggle.isVisible()) {
        const toggle = page.locator('input[type="checkbox"]').filter({ 
          has: page.locator('text=Kategorien manuell wählen') 
        }).first();
        if (await toggle.isVisible()) {
          await toggle.check();
        }
      }
      
      const startButton = page.locator('button').filter({ 
        hasText: /Spiel starten|Start Game/ 
      }).first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('Could not navigate to category selection');
    }
    
    const categoryTitle = page.locator('text=Kategorien auswählen').first();
    if (await categoryTitle.isVisible()) {
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      console.log(`Body height: ${bodyHeight}, Viewport height: 375`);
      
      if (bodyHeight > 375) {
        console.log('Content extends beyond short viewport - this is expected');
        
        // Check that all essential elements are reachable
        const footer = page.locator('[data-testid="game-shell-footer"]').first();
        if (await footer.isVisible()) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(300);
          
          const footerBox = await footer.boundingBox();
          if (footerBox && footerBox.y < 375) {
            console.log('✓ Footer reachable via scroll');
          } else {
            console.log('❌ ISSUE: Footer not reachable');
          }
        }
      }
    }
  });
  
  test('Check medium tablet portrait', async ({ page }) => {
    // iPad Mini
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('=== DIAGNOSTIC: Tablet Portrait (768x1024) ===');
    
    // Navigate to category selection
    try {
      const categoryToggle = page.locator('text=Kategorien manuell wählen').first();
      if (await categoryToggle.isVisible()) {
        const toggle = page.locator('input[type="checkbox"]').filter({ 
          has: page.locator('text=Kategorien manuell wählen') 
        }).first();
        if (await toggle.isVisible()) {
          await toggle.check();
        }
      }
      
      const startButton = page.locator('button').filter({ 
        hasText: /Spiel starten|Start Game/ 
      }).first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('Could not navigate to category selection');
    }
    
    const categoryTitle = page.locator('text=Kategorien auswählen').first();
    if (await categoryTitle.isVisible()) {
      // Check if layout uses tablet space well
      const mainContainer = page.locator('.max-h-\\[calc\\(100vh-8rem\\)\\]').first();
      if (await mainContainer.isVisible()) {
        const containerBox = await mainContainer.boundingBox();
        if (containerBox) {
          console.log(`Container width on tablet: ${containerBox.width} (viewport: 768)`);
          
          // Should use more space on tablet
          if (containerBox.width < 500) {
            console.log('❌ ISSUE: Container too narrow on tablet');
          } else {
            console.log('✓ Container uses tablet space well');
          }
        }
      }
      
      // Check category grid columns
      const categoryGrid = page.locator('.grid.grid-cols-2').first();
      if (await categoryGrid.isVisible()) {
        const gridStyle = await categoryGrid.evaluate((el) => {
          return window.getComputedStyle(el).gridTemplateColumns;
        });
        
        const columnCount = gridStyle.split(' ').length;
        console.log(`Grid columns on tablet: ${columnCount} (expected: 3 with sm:grid-cols-3)`);
        
        if (columnCount < 3) {
          console.log('❌ ISSUE: Grid should show 3 columns on tablet');
        } else {
          console.log('✓ Grid shows proper columns on tablet');
        }
      }
    }
  });
});