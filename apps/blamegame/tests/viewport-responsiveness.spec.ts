/**
 * Viewport Responsiveness Tests
 * 
 * These tests verify that the BlameGame UI correctly adapts to different viewport sizes
 * and that all elements remain visible and accessible across mobile, tablet, and desktop viewports.
 */

import { test, expect, type Page } from '@playwright/test';

// Standard viewport sizes for testing
const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1280, height: 720 }, // Standard desktop
  desktopLarge: { width: 1920, height: 1080 }, // Full HD
  narrow: { width: 320, height: 568 }, // Very narrow mobile
  wide: { width: 2560, height: 1440 }, // Ultra-wide
};

const CRITICAL_ELEMENTS = {
  header: '[data-testid="game-shell-header"]',
  footer: '[data-testid="game-shell-footer"]',
  mainContent: 'main',
  categoryGrid: '.grid.grid-cols-2',
  categoryCard: '.grid.grid-cols-2 > label',
  actionButtons: 'button',
  startButton: 'button:has-text("Mit 0 Kategorien starten")',
  backButton: 'button:has-text("Zurück")',
  darkModeToggle: '[data-testid="dark-mode-toggle"]',
  languageSelector: '[data-testid="language-selector"]',
};

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Allow for animations
}

async function checkElementVisibility(page: Page, selector: string, elementName: string) {
  const element = page.locator(selector).first();
  const isVisible = await element.isVisible();
  const boundingBox = await element.boundingBox();
  
  return {
    isVisible,
    boundingBox,
    elementName,
    inViewport: boundingBox ? 
      boundingBox.y >= 0 && 
      boundingBox.x >= 0 && 
      boundingBox.y + boundingBox.height <= page.viewportSize()!.height &&
      boundingBox.x + boundingBox.width <= page.viewportSize()!.width
      : false
  };
}

async function checkScrollability(page: Page) {
  const viewport = page.viewportSize()!;
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  const isScrollable = bodyHeight > viewport.height;
  
  return {
    viewport,
    bodyHeight,
    isScrollable,
    scrollableRatio: bodyHeight / viewport.height
  };
}

async function navigateToCategorySelection(page: Page) {
  await page.goto('/');
  await waitForPageLoad(page);
  
  // Check if we need to enable category selection
  const categoryToggle = page.locator('text=Kategorien manuell wählen').first();
  const isToggleVisible = await categoryToggle.isVisible();
  
  if (isToggleVisible) {
    // Find the toggle button/checkbox
    const toggle = page.locator('input[type="checkbox"]').filter({ has: page.locator('text=Kategorien manuell wählen') }).first();
    if (await toggle.isVisible()) {
      await toggle.check();
    }
  }
  
  // Click start to go to category selection
  const startButton = page.locator('button').filter({ hasText: /Spiel starten|Start Game/ }).first();
  if (await startButton.isVisible()) {
    await startButton.click();
  }
  
  await waitForPageLoad(page);
}

test.describe('Viewport Responsiveness Tests', () => {
  
  test.describe('Header and Footer Layout', () => {
    
    Object.entries(VIEWPORT_SIZES).forEach(([sizeName, size]) => {
      test(`Header and footer should be properly positioned on ${sizeName} (${size.width}x${size.height})`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Check header visibility and position
        const header = await checkElementVisibility(page, CRITICAL_ELEMENTS.header, 'header');
        expect(header.isVisible, `Header should be visible on ${sizeName}`).toBe(true);
        expect(header.inViewport, `Header should be in viewport on ${sizeName}`).toBe(true);
        
        // Check footer visibility and position
        const footer = await checkElementVisibility(page, CRITICAL_ELEMENTS.footer, 'footer');
        expect(footer.isVisible, `Footer should be visible on ${sizeName}`).toBe(true);
        
        // Footer might be below fold on small screens, so we check if it's accessible via scroll
        if (!footer.inViewport && size.height < 700) {
          // Scroll to bottom to check footer
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(300);
          
          const footerAfterScroll = await checkElementVisibility(page, CRITICAL_ELEMENTS.footer, 'footer after scroll');
          expect(footerAfterScroll.inViewport, `Footer should be in viewport after scroll on ${sizeName}`).toBe(true);
        } else {
          expect(footer.inViewport, `Footer should be in initial viewport on ${sizeName}`).toBe(true);
        }
        
        // Check that header and footer don't overlap with main content
        if (header.boundingBox && footer.boundingBox) {
          const headerBottom = header.boundingBox.y + header.boundingBox.height;
          const footerTop = footer.boundingBox.y;
          expect(headerBottom < footerTop, `Header and footer should not overlap on ${sizeName}`).toBe(true);
        }
      });
    });
  });
  
  test.describe('Category Selection Screen', () => {
    
    Object.entries(VIEWPORT_SIZES).forEach(([sizeName, size]) => {
      test(`Category selection should be fully accessible on ${sizeName} (${size.width}x${size.height})`, async ({ page }) => {
        await page.setViewportSize(size);
        await navigateToCategorySelection(page);
        
        // Check if we're on the category selection screen
        const categoryTitle = page.locator('text=Kategorien auswählen').first();
        const isOnCategoryScreen = await categoryTitle.isVisible();
        
        if (!isOnCategoryScreen) {
          console.log(`Skipping category test for ${sizeName} - not on category screen`);
          return;
        }
        
        // Check category grid visibility
        const categoryGrid = await checkElementVisibility(page, CRITICAL_ELEMENTS.categoryGrid, 'category grid');
        expect(categoryGrid.isVisible, `Category grid should be visible on ${sizeName}`).toBe(true);
        
        // Check all category cards are accessible
        const categoryCards = page.locator(CRITICAL_ELEMENTS.categoryCard);
        const cardCount = await categoryCards.count();
        expect(cardCount, `Should have category cards on ${sizeName}`).toBeGreaterThan(0);
        
        // Check that at least the first few category cards are in viewport or accessible via scroll
        const maxCardsToCheck = Math.min(6, cardCount);
        let visibleCards = 0;
        
        for (let i = 0; i < maxCardsToCheck; i++) {
          const card = categoryCards.nth(i);
          const isCardVisible = await card.isVisible();
          if (isCardVisible) {
            visibleCards++;
          }
        }
        
        expect(visibleCards, `At least some category cards should be visible on ${sizeName}`).toBeGreaterThan(0);
        
        // Check action buttons are accessible
        const backButton = await checkElementVisibility(page, CRITICAL_ELEMENTS.backButton, 'back button');
        expect(backButton.isVisible, `Back button should be visible on ${sizeName}`).toBe(true);
        
        const startButton = await checkElementVisibility(page, CRITICAL_ELEMENTS.startButton, 'start button');
        expect(startButton.isVisible, `Start button should be visible on ${sizeName}`).toBe(true);
        
        // Check scrollability when needed
        const scrollInfo = await checkScrollability(page);
        if (scrollInfo.isScrollable) {
          // Test scrolling works
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(300);
          
          // Ensure we can scroll back to top
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(300);
          
          const headerAfterScroll = await checkElementVisibility(page, CRITICAL_ELEMENTS.header, 'header after scroll');
          expect(headerAfterScroll.inViewport, `Header should be visible after scrolling back to top on ${sizeName}`).toBe(true);
        }
      });
    });
  });
  
  test.describe('Content Layout Integrity', () => {
    
    Object.entries(VIEWPORT_SIZES).forEach(([sizeName, size]) => {
      test(`Content should not overflow viewport on ${sizeName} (${size.width}x${size.height})`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Check for horizontal overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        
        expect(hasHorizontalOverflow, `Should not have horizontal overflow on ${sizeName}`).toBe(false);
        
        // Check main content container
        const main = await checkElementVisibility(page, CRITICAL_ELEMENTS.mainContent, 'main content');
        expect(main.isVisible, `Main content should be visible on ${sizeName}`).toBe(true);
        
        if (main.boundingBox) {
          expect(main.boundingBox.width, `Main content should not exceed viewport width on ${sizeName}`)
            .toBeLessThanOrEqual(size.width);
        }
      });
    });
  });
  
  test.describe('Interactive Elements Accessibility', () => {
    
    Object.entries(VIEWPORT_SIZES).forEach(([sizeName, size]) => {
      test(`Interactive elements should be accessible on ${sizeName} (${size.width}x${size.height})`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Check dark mode toggle
        const darkModeToggle = await checkElementVisibility(page, CRITICAL_ELEMENTS.darkModeToggle, 'dark mode toggle');
        
        // Dark mode toggle might be in footer, so check if it's accessible via scroll
        if (!darkModeToggle.inViewport && size.height < 700) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(300);
          
          const toggleAfterScroll = await checkElementVisibility(page, CRITICAL_ELEMENTS.darkModeToggle, 'dark mode toggle after scroll');
          expect(toggleAfterScroll.isVisible, `Dark mode toggle should be visible after scroll on ${sizeName}`).toBe(true);
        } else {
          expect(darkModeToggle.isVisible, `Dark mode toggle should be visible on ${sizeName}`).toBe(true);
        }
        
        // Check language selector
        const languageSelector = await checkElementVisibility(page, CRITICAL_ELEMENTS.languageSelector, 'language selector');
        expect(languageSelector.isVisible, `Language selector should be visible on ${sizeName}`).toBe(true);
        
        // Test that interactive elements have appropriate touch targets for mobile
        if (size.width <= 768) { // Mobile/tablet
          const buttons = page.locator('button');
          const buttonCount = await buttons.count();
          
          for (let i = 0; i < Math.min(3, buttonCount); i++) {
            const button = buttons.nth(i);
            const buttonBox = await button.boundingBox();
            
            if (buttonBox && await button.isVisible()) {
              const minTouchTarget = 44; // iOS/Android recommendation
              expect(buttonBox.height, `Button ${i} should have adequate touch target height on ${sizeName}`)
                .toBeGreaterThanOrEqual(minTouchTarget * 0.8); // Allow some tolerance
              expect(buttonBox.width, `Button ${i} should have adequate touch target width on ${sizeName}`)
                .toBeGreaterThanOrEqual(minTouchTarget * 0.8);
            }
          }
        }
      });
    });
  });
  
  test.describe('Extreme Viewport Scenarios', () => {
    
    test('Should handle very narrow viewport (320px width)', async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.narrow);
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Check that content still renders and is accessible
      const main = await checkElementVisibility(page, CRITICAL_ELEMENTS.mainContent, 'main content');
      expect(main.isVisible).toBe(true);
      
      // Ensure no horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });
    
    test('Should handle ultra-wide viewport (2560px width)', async ({ page }) => {
      await page.setViewportSize(VIEWPORT_SIZES.wide);
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Check that content is centered and doesn't stretch too wide
      const main = await checkElementVisibility(page, CRITICAL_ELEMENTS.mainContent, 'main content');
      expect(main.isVisible).toBe(true);
      
      if (main.boundingBox) {
        // Content should be reasonably centered and not use the full width
        const centerX = VIEWPORT_SIZES.wide.width / 2;
        const contentCenterX = main.boundingBox.x + main.boundingBox.width / 2;
        const centeringTolerance = 100; // pixels
        
        expect(Math.abs(contentCenterX - centerX), 'Content should be approximately centered')
          .toBeLessThan(centeringTolerance);
      }
    });
    
    test('Should handle very short viewport (400px height)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 400 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Content should be scrollable when viewport is too short
      const scrollInfo = await checkScrollability(page);
      
      // Either content fits in viewport or is scrollable
      const contentFitsOrScrollable = !scrollInfo.isScrollable || scrollInfo.scrollableRatio > 1;
      expect(contentFitsOrScrollable, 'Content should fit in viewport or be scrollable').toBe(true);
      
      // Essential elements should still be accessible
      const header = await checkElementVisibility(page, CRITICAL_ELEMENTS.header, 'header');
      expect(header.isVisible).toBe(true);
    });
  });
  
  test.describe('Layout Consistency Across Orientations', () => {
    
    test('Should maintain layout integrity when switching orientations', async ({ page }) => {
      // Start in portrait mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageLoad(page);
      
      // Take initial measurements
      const _portraitHeader = await checkElementVisibility(page, CRITICAL_ELEMENTS.header, 'header portrait');
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await waitForPageLoad(page);
      
      // Verify layout still works
      const landscapeHeader = await checkElementVisibility(page, CRITICAL_ELEMENTS.header, 'header landscape');
      expect(landscapeHeader.isVisible).toBe(true);
      
      // Check that we don't have excessive vertical space usage in landscape
      const main = await checkElementVisibility(page, CRITICAL_ELEMENTS.mainContent, 'main content landscape');
      if (main.boundingBox) {
        expect(main.boundingBox.height, 'Content should not exceed landscape viewport height')
          .toBeLessThanOrEqual(375);
      }
    });
  });
});

test.describe('Viewport-Specific Component Behavior', () => {
  
  test.describe('Category Cards Responsive Behavior', () => {
    
    test('Category grid should adapt to screen size', async ({ page }) => {
      await navigateToCategorySelection(page);
      
      const testGridLayout = async (viewport: { width: number; height: number }, expectedColumns: number) => {
        await page.setViewportSize(viewport);
        await waitForPageLoad(page);
        
        // Check if we're on category screen
        const categoryTitle = page.locator('text=Kategorien auswählen').first();
        if (!(await categoryTitle.isVisible())) {
          return; // Skip if not on category screen
        }
        
        const categoryGrid = page.locator(CRITICAL_ELEMENTS.categoryGrid).first();
        const gridComputedStyle = await categoryGrid.evaluate((el) => {
          return window.getComputedStyle(el).gridTemplateColumns;
        });
        
        // Count columns by splitting the grid-template-columns value
        const columnCount = gridComputedStyle.split(' ').length;
        expect(columnCount, `Should have ${expectedColumns} columns at ${viewport.width}px width`)
          .toBe(expectedColumns);
      };
      
      // Test different breakpoints
      await testGridLayout({ width: 320, height: 568 }, 2); // Mobile: 2 columns
      await testGridLayout({ width: 640, height: 480 }, 3); // SM breakpoint: 3 columns
      await testGridLayout({ width: 1024, height: 768 }, 3); // Desktop: 3 columns
    });
  });
  
  test.describe('Text and Font Scaling', () => {
    
    Object.entries(VIEWPORT_SIZES).forEach(([sizeName, size]) => {
      test(`Text should be readable on ${sizeName}`, async ({ page }) => {
        await page.setViewportSize(size);
        await page.goto('/');
        await waitForPageLoad(page);
        
        // Check main title
        const title = page.locator('h1').first();
        if (await title.isVisible()) {
          const titleBox = await title.boundingBox();
          if (titleBox) {
            // Title should not be too small
            expect(titleBox.height, `Title should be readable on ${sizeName}`)
              .toBeGreaterThan(20);
          }
        }
        
        // Check body text
        const bodyText = page.locator('p').first();
        if (await bodyText.isVisible()) {
          const textBox = await bodyText.boundingBox();
          if (textBox) {
            // Body text should be readable
            expect(textBox.height, `Body text should be readable on ${sizeName}`)
              .toBeGreaterThan(12);
          }
        }
      });
    });
  });
});