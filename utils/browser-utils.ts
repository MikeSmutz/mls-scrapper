import { Page, Browser, BrowserContext } from '@playwright/test';

/**
 * Utility functions for browser automation
 */

/**
 * Wait for network to be idle (no requests for specified time)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  let requestCount = 0;
  let timer: NodeJS.Timeout;

  const onRequest = () => {
    requestCount++;
    clearTimeout(timer);
  };

  const onResponse = () => {
    requestCount--;
    if (requestCount === 0) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        page.off('request', onRequest);
        page.off('response', onResponse);
      }, timeout);
    }
  };

  page.on('request', onRequest);
  page.on('response', onResponse);

  return new Promise((resolve) => {
    timer = setTimeout(() => {
      page.off('request', onRequest);
      page.off('response', onResponse);
      resolve();
    }, timeout);
  });
}

/**
 * Take a full page screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page, 
  name: string = 'screenshot'
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const path = `./data/screenshots/${filename}`;
  
  await page.screenshot({ path, fullPage: true });
  return path;
}

/**
 * Scroll to bottom of page gradually (for infinite scroll)
 */
export async function scrollToBottom(page: Page, maxScrolls: number = 10): Promise<void> {
  let previousHeight = 0;
  let scrollCount = 0;

  while (scrollCount < maxScrolls) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000); // Wait for content to load
    
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) {
      break; // No more content to load
    }
    
    previousHeight = currentHeight;
    scrollCount++;
  }
}

/**
 * Handle cookie consent banners
 */
export async function handleCookieConsent(page: Page): Promise<void> {
  const cookieSelectors = [
    'button[id*="accept"]',
    'button[id*="cookie"]',
    'button[class*="accept"]',
    'button[class*="cookie"]',
    '[data-testid*="accept"]',
    '[data-testid*="cookie"]',
    'text=Accept',
    'text=Accept All',
    'text=I Accept',
    'text=OK',
  ];

  for (const selector of cookieSelectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        await element.click();
        await page.waitForTimeout(1000);
        break;
      }
    } catch (error) {
      // Continue to next selector
    }
  }
}

/**
 * Block unnecessary resources to speed up automation
 */
export async function blockUnnecessaryResources(page: Page): Promise<void> {
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    const url = route.request().url();
    
    // Block images, stylesheets, fonts for faster loading
    if (['image', 'stylesheet', 'font'].includes(resourceType)) {
      route.abort();
    }
    // Block analytics and ads
    else if (
      url.includes('google-analytics') ||
      url.includes('googletagmanager') ||
      url.includes('facebook.com') ||
      url.includes('doubleclick') ||
      url.includes('adsystem')
    ) {
      route.abort();
    } else {
      route.continue();
    }
  });
}

/**
 * Set stealth mode to avoid detection
 */
export async function setStealthMode(context: BrowserContext): Promise<void> {
  // Remove automation indicators
  await context.addInitScript(() => {
    // Remove webdriver property
    delete (window.navigator as any).webdriver;
    
    // Mock chrome runtime
    (window as any).chrome = {
      runtime: {},
    };
    
    // Mock permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });
}

/**
 * Random delay to mimic human behavior
 */
export async function randomDelay(min: number = 500, max: number = 2000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Type text with human-like delays
 */
export async function humanType(page: Page, selector: string, text: string): Promise<void> {
  await page.click(selector);
  await page.fill(selector, ''); // Clear existing text
  
  for (const char of text) {
    await page.keyboard.type(char);
    await randomDelay(50, 150); // Random delay between keystrokes
  }
}
