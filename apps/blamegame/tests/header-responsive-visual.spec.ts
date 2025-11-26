/**
 * Visual responsiveness tests for GameHeader and related components
 * 
 * Tests various viewport sizes and orientations to ensure:
 * - Text doesn't overflow containers
 * - Headers maintain readable sizes
 * - Content remains accessible
 * - Touch targets are appropriately sized
 */
import { test, expect, Page } from '@playwright/test';

// Test viewport configurations
const viewports = [
  // Mobile devices
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'Samsung Galaxy S21 Ultra', width: 384, height: 854 },
  
  // Tablets
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Pro 11"', width: 834, height: 1194 },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },
  { name: 'Samsung Galaxy Tab S7', width: 800, height: 1280 },
  
  // Desktop
  { name: 'Desktop Small', width: 1280, height: 720 },
  { name: 'Desktop Medium', width: 1440, height: 900 },
  { name: 'Desktop Large', width: 1920, height: 1080 },
  { name: 'Desktop Ultra Wide', width: 2560, height: 1440 },
];

// Helper functions for visual checks
async function checkTextOverflow(page: Page, selector: string, elementName: string) {
  const element = page.locator(selector);
  if (await element.count() === 0) return; // Element not present on this screen
  
  const box = await element.boundingBox();
  const parentBox = await element.locator('..').boundingBox();
  
  if (box && parentBox) {
    // Check if text is flowing outside its container
    expect(box.width, `${elementName} width should not exceed parent container`).toBeLessThanOrEqual(parentBox.width + 5); // 5px tolerance
    expect(box.height, `${elementName} height should not exceed parent container`).toBeLessThanOrEqual(parentBox.height + 5);
  }
  
  // Check if text is readable (not too small)
  const computedStyle = await element.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      fontSize: parseFloat(style.fontSize),
      lineHeight: style.lineHeight,
      visibility: style.visibility,
      opacity: parseFloat(style.opacity),
    };
  });
  
  expect(computedStyle.fontSize, `${elementName} font size should be readable (>=12px)`).toBeGreaterThanOrEqual(12);
  expect(computedStyle.visibility, `${elementName} should be visible`).toBe('visible');
  expect(computedStyle.opacity, `${elementName} should be opaque`).toBeGreaterThan(0.5);
}

async function checkTouchTargetSize(page: Page, selector: string, elementName: string) {
  const element = page.locator(selector);
  if (await element.count() === 0) return;
  
  const box = await element.boundingBox();
  if (box) {
    // PWA guidelines: touch targets should be at least 44x44px
    expect(box.height, `${elementName} should meet minimum touch target height (44px)`).toBeGreaterThanOrEqual(44);
    expect(box.width, `${elementName} should meet minimum touch target width (44px)`).toBeGreaterThanOrEqual(44);
  }
}

async function checkHeaderFooterBalance(page: Page) {
  const header = page.locator('[data-testid="game-header"], header');
  const footer = page.locator('[data-testid="game-footer"], footer');
  
  if (await header.count() > 0 && await footer.count() > 0) {
    const headerBox = await header.boundingBox();
    const footerBox = await footer.boundingBox();
    
    if (headerBox && footerBox) {
      // Header should be roughly the same height as footer or slightly larger (PWA best practice)
      const heightDifference = Math.abs(headerBox.height - footerBox.height);
      expect(heightDifference, 'Header and footer heights should be balanced').toBeLessThan(footerBox.height * 0.5);
    }
  }
}

// Test each viewport and orientation
viewports.forEach(viewport => {
  test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    
    test('Portrait - Header and subtitle visual layout', async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      
      // Check main game header
      await checkTextOverflow(page, 'h1', 'Game Title');
      
      // Check subtitle if present
      await checkTextOverflow(page, 'p[class*="subtitle"], p[class*="tagline"]', 'Subtitle/Tagline');
      
      // Check that header doesn't push content off screen
      const viewportHeight = viewport.height;
      const header = page.locator('header, [data-testid="game-header"]');
      if (await header.count() > 0) {
        const headerBox = await header.boundingBox();
        if (headerBox) {
          expect(headerBox.height, 'Header should not take up more than 20% of viewport height').toBeLessThan(viewportHeight * 0.2);
        }
      }
      
      // Check header/footer balance
      await checkHeaderFooterBalance(page);
    });
    
    test('Landscape - Header and subtitle visual layout', async ({ page }) => {
      // Swap width and height for landscape
      await page.setViewportSize({ width: viewport.height, height: viewport.width });
      await page.goto('/');
      
      await page.waitForLoadState('networkidle');
      
      // Same checks but in landscape orientation
      await checkTextOverflow(page, 'h1', 'Game Title (Landscape)');
      await checkTextOverflow(page, 'p[class*="subtitle"], p[class*="tagline"]', 'Subtitle/Tagline (Landscape)');
      
      // In landscape, header should take even less vertical space
      const viewportHeight = viewport.width; // swapped for landscape
      const header = page.locator('header, [data-testid="game-header"]');
      if (await header.count() > 0) {
        const headerBox = await header.boundingBox();
        if (headerBox) {
          expect(headerBox.height, 'Header should not take up more than 15% of viewport height in landscape').toBeLessThan(viewportHeight * 0.15);
        }
      }
    });
    
    test('Touch target accessibility', async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      await page.waitForLoadState('networkidle');
      
      // Check clickable header elements
      await checkTouchTargetSize(page, 'h1[onclick], h1[class*="cursor-pointer"]', 'Clickable Game Title');
      
      // Check any buttons in header area
      await checkTouchTargetSize(page, 'header button, [data-testid="game-header"] button', 'Header Buttons');
    });
    
    test('Content overflow and readability', async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal scrollbars (should not exist)
      const horizontalScrollbar = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(horizontalScrollbar, 'Page should not have horizontal scrollbar').toBe(false);
      
      // Check that main content is visible and not pushed off screen
      const mainContent = page.locator('main, [role="main"], .main-content');
      if (await mainContent.count() > 0) {
        const mainBox = await mainContent.boundingBox();
        if (mainBox) {
          expect(mainBox.y, 'Main content should be visible on screen').toBeGreaterThanOrEqual(0);
          expect(mainBox.height, 'Main content should have reasonable height').toBeGreaterThan(100);
        }
      }
    });
  });
});

// Specific edge case tests
test.describe('Edge Cases and Stress Tests', () => {
  test('Very long title handling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // We'll test long title by directly modifying the DOM after load instead of using window
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Inject a very long title after page load
    await page.evaluate(() => {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        titleElement.textContent = 'This is an extremely long game title that should definitely wrap properly and not overflow the container boundaries in any way shape or form';
      }
    });
    
    // Wait for layout to settle
    await page.waitForTimeout(100);
    
    // Check that the long title is handled properly
    await checkTextOverflow(page, 'h1', 'Very Long Game Title');
  });
  
  test('Very small viewport handling', async ({ page }) => {
    // Test extremely small viewport
    await page.setViewportSize({ width: 280, height: 480 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Text should still be readable
    await checkTextOverflow(page, 'h1', 'Game Title (Very Small Viewport)');
    await checkTextOverflow(page, 'p[class*="subtitle"]', 'Subtitle (Very Small Viewport)');
    
    // Content should still be accessible
    const title = page.locator('h1');
    if (await title.count() > 0) {
      const computedStyle = await title.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      const fontSize = parseFloat(computedStyle);
      expect(fontSize, 'Title should remain readable even on very small screens').toBeGreaterThanOrEqual(14);
    }
  });
  
  test('Font loading and fallback', async ({ page }) => {
    // Block font loading to test fallback fonts
    await page.route('**/*.woff*', route => route.abort());
    await page.route('**/*font*', route => route.abort());
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Title should still be visible with fallback fonts
    const title = page.locator('h1');
    if (await title.count() > 0) {
      const isVisible = await title.isVisible();
      expect(isVisible, 'Title should be visible even with custom fonts blocked').toBe(true);
    }
  });
  
  test('Dynamic content changes', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate title change
    await page.evaluate(() => {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        titleElement.textContent = 'Changed Game Title That Is Much Longer Than Before';
      }
    });
    
    // Check that the new content doesn't overflow
    await page.waitForTimeout(100); // Allow for any layout recalculations
    await checkTextOverflow(page, 'h1', 'Dynamically Changed Title');
  });
});

// Performance and animation tests
test.describe('Performance and Animations', () => {
  test('Responsive layout performance', async ({ page }) => {
    await page.goto('/');
    
    // Test rapid viewport changes (like device rotation)
    const viewportSizes = [
      { width: 375, height: 667 },
      { width: 667, height: 375 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 }
    ];
    
    for (const size of viewportSizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(200); // Allow for responsive adjustments
      
      // Check that layout is still correct after resize
      await checkTextOverflow(page, 'h1', `Game Title (${size.width}x${size.height})`);
    }
  });
  
  test('Text rendering consistency', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshots at different zoom levels to ensure text renders consistently
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const title = page.locator('h1');
    if (await title.count() > 0) {
      // Check text clarity and rendering
      const screenshot = await title.screenshot();
      expect(screenshot.length, 'Title should render with reasonable file size').toBeGreaterThan(100);
    }
  });
});