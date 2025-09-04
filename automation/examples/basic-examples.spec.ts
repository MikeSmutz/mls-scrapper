import { test, expect } from '@playwright/test';
import { 
  takeTimestampedScreenshot,
  handleCookieConsent,
  waitForNetworkIdle,
  randomDelay,
  humanType
} from '../../utils/browser-utils';
import { saveToJSON } from '../../utils/data-utils';

test.describe('Basic Automation Examples', () => {
  
  test('Navigate and interact with a website', async ({ page }) => {
    // Navigate to the Playwright documentation
    await page.goto('https://playwright.dev/');
    
    // Take initial screenshot
    await takeTimestampedScreenshot(page, 'playwright-homepage');
    
    // Verify page title
    await expect(page).toHaveTitle(/Playwright/);
    
    // Click on "Get started" link
    await page.getByRole('link', { name: 'Get started' }).click();
    
    // Verify we're on the installation page
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
    
    // Take screenshot of the installation page
    await takeTimestampedScreenshot(page, 'playwright-installation');
    
    console.log('✅ Basic navigation completed successfully');
  });
  
  test('Search and filter content', async ({ page }) => {
    // Navigate to a demo e-commerce site
    await page.goto('https://webscraper.io/test-sites/e-commerce/allinone');
    
    await handleCookieConsent(page);
    await waitForNetworkIdle(page);
    
    // Search for a product
    const searchTerm = 'phone';
    const searchBox = page.locator('input[placeholder*="search"], input[type="search"]');
    
    if (await searchBox.isVisible()) {
      await humanType(page, 'input[placeholder*="search"]', searchTerm);
      await page.keyboard.press('Enter');
      await waitForNetworkIdle(page);
    } else {
      // If no search box, navigate to phones category
      await page.click('a[href*="phones"]');
      await waitForNetworkIdle(page);
    }
    
    // Take screenshot of search results
    await takeTimestampedScreenshot(page, 'search-results');
    
    // Count products found
    const productCount = await page.locator('.thumbnail, .product').count();
    console.log(`📱 Found ${productCount} products`);
    
    expect(productCount).toBeGreaterThan(0);
  });
  
  test('Handle different types of alerts and modals', async ({ page }) => {
    // Navigate to a demo page with alerts
    await page.goto('https://the-internet.herokuapp.com/javascript_alerts');
    
    // Test JavaScript Alert
    page.on('dialog', async dialog => {
      console.log(`Alert message: ${dialog.message()}`);
      await dialog.accept();
    });
    
    await page.click('button:has-text("Click for JS Alert")');
    await randomDelay();
    
    // Test JavaScript Confirm
    page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') {
        console.log(`Confirm message: ${dialog.message()}`);
        await dialog.accept(); // or dialog.dismiss() to cancel
      }
    });
    
    await page.click('button:has-text("Click for JS Confirm")');
    await randomDelay();
    
    // Test JavaScript Prompt
    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        console.log(`Prompt message: ${dialog.message()}`);
        await dialog.accept('Hello from Playwright!');
      }
    });
    
    await page.click('button:has-text("Click for JS Prompt")');
    await randomDelay();
    
    // Verify the result
    const result = await page.locator('#result').textContent();
    expect(result).toContain('Hello from Playwright!');
    
    await takeTimestampedScreenshot(page, 'alert-handling-complete');
    
    console.log('✅ Alert handling completed');
  });
  
  test('File download automation', async ({ page }) => {
    // Navigate to a page with downloadable files
    await page.goto('https://the-internet.herokuapp.com/download');
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    
    // Click on first download link
    const firstDownloadLink = page.locator('a[href*=".txt"]').first();
    await firstDownloadLink.click();
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Save download to specific location
    const fileName = download.suggestedFilename() || 'downloaded-file.txt';
    const downloadPath = `./data/downloads/${fileName}`;
    await download.saveAs(downloadPath);
    
    console.log(`📥 File downloaded: ${downloadPath}`);
    
    // Verify download
    expect(download.suggestedFilename()).toBeTruthy();
    
    const downloadInfo = {
      fileName: download.suggestedFilename(),
      downloadPath,
      downloadedAt: new Date().toISOString()
    };
    
    await saveToJSON(downloadInfo, 'download-info');
  });
  
  test('Handle iframes and embedded content', async ({ page }) => {
    // Navigate to a page with iframes
    await page.goto('https://the-internet.herokuapp.com/iframe');
    
    // Wait for iframe to load
    const iframe = page.frameLocator('#mce_0_ifr');
    
    // Clear existing content and type new content
    const editor = iframe.locator('body[contenteditable="true"]');
    await editor.clear();
    await editor.fill('This text was entered via Playwright automation!');
    
    // Take screenshot
    await takeTimestampedScreenshot(page, 'iframe-editing');
    
    // Verify the content was entered
    const iframeContent = await editor.textContent();
    expect(iframeContent).toContain('Playwright automation');
    
    console.log('✅ Iframe interaction completed');
  });
  
  test('Handle hover and mouse interactions', async ({ page }) => {
    // Navigate to hover demo
    await page.goto('https://the-internet.herokuapp.com/hovers');
    
    const hoverResults: any[] = [];
    
    // Test hover on multiple elements
    for (let i = 1; i <= 3; i++) {
      const figure = page.locator(`.figure:nth-child(${i})`);
      
      // Hover over the image
      await figure.hover();
      await randomDelay(500, 1000);
      
      // Verify hover effect appears
      const caption = figure.locator('.figcaption');
      const isVisible = await caption.isVisible();
      
      if (isVisible) {
        const captionText = await caption.textContent();
        hoverResults.push({
          figureNumber: i,
          hoverWorked: true,
          captionText: captionText?.trim()
        });
      }
      
      // Take screenshot during hover
      await takeTimestampedScreenshot(page, `hover-effect-${i}`);
      
      // Move mouse away
      await page.mouse.move(0, 0);
      await randomDelay();
    }
    
    await saveToJSON(hoverResults, 'hover-test-results');
    
    console.log('✅ Hover interactions completed');
  });
  
  test('Handle drag and drop operations', async ({ page }) => {
    // Navigate to drag and drop demo
    await page.goto('https://the-internet.herokuapp.com/drag_and_drop');
    
    // Take before screenshot
    await takeTimestampedScreenshot(page, 'drag-drop-before');
    
    // Get initial positions
    const sourceText = await page.locator('#column-a').textContent();
    const targetText = await page.locator('#column-b').textContent();
    
    console.log(`Before drag: A="${sourceText}", B="${targetText}"`);
    
    // Perform drag and drop
    await page.dragAndDrop('#column-a', '#column-b');
    await randomDelay();
    
    // Take after screenshot
    await takeTimestampedScreenshot(page, 'drag-drop-after');
    
    // Verify the drag and drop worked
    const newSourceText = await page.locator('#column-a').textContent();
    const newTargetText = await page.locator('#column-b').textContent();
    
    console.log(`After drag: A="${newSourceText}", B="${newTargetText}"`);
    
    // Verify elements swapped positions
    expect(newSourceText).toBe(targetText);
    expect(newTargetText).toBe(sourceText);
    
    const dragDropResult = {
      before: { columnA: sourceText, columnB: targetText },
      after: { columnA: newSourceText, columnB: newTargetText },
      success: newSourceText === targetText && newTargetText === sourceText,
      testedAt: new Date().toISOString()
    };
    
    await saveToJSON(dragDropResult, 'drag-drop-results');
    
    console.log('✅ Drag and drop completed');
  });
});
