import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { 
  setStealthMode, 
  randomDelay, 
  humanType, 
  waitForNetworkIdle,
  takeTimestampedScreenshot
} from '../../utils/browser-utils';
import { saveToJSON, createDataDirectories } from '../../utils/data-utils';

// MLS Matrix Automation Configuration
const MLS_CONFIG = {
  baseUrl: process.env.MLS_BASE_URL || 'https://matrix.lvar-mls.com/matrix/?f=',
  username: process.env.MLS_USERNAME || '',
  password: process.env.MLS_PASSWORD || '',
  downloadTimeout: parseInt(process.env.DOWNLOAD_WAIT_TIMEOUT || '30000'),
  headless: process.env.HEADLESS_MODE === 'true',
  slowModeDelay: parseInt(process.env.SLOW_MODE_DELAY || '1000')
};

// MLS specific anti-detection configuration
async function setupMLSContext(context: BrowserContext) {
  // Apply stealth mode
  await setStealthMode(context);
  
  // Set cookies to appear as returning user
  await context.addCookies([
    {
      name: '_ga',
      value: `GA1.2.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now() / 1000)}`,
      domain: '.lvar-mls.com',
      path: '/'
    }
  ]);
  
  // Add extra headers
  await context.setExtraHTTPHeaders({
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': '1'
  });
}

// Handle MLS login with anti-detection measures
async function loginToMLS(page: Page) {
  console.log('🔐 Logging into MLS Matrix...');
  
  // Navigate to login page
  await page.goto(MLS_CONFIG.baseUrl, { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });
  
  // Wait for page to fully load
  await randomDelay(2000, 4000);
  
  // Check if already logged in
  const isLoggedIn = await page.evaluate(() => {
    return document.body.textContent?.includes('Logout') || 
           document.body.textContent?.includes('Sign Out');
  });
  
  if (isLoggedIn) {
    console.log('✅ Already logged in!');
    return;
  }
  
  // Look for username field with multiple possible selectors
  const usernameSelectors = [
    'input[name="username"]',
    'input[id*="username"]',
    'input[type="text"][placeholder*="Username"]',
    'input[type="text"][placeholder*="User"]',
    '#loginId',
    '#username'
  ];
  
  let usernameField = null;
  for (const selector of usernameSelectors) {
    if (await page.locator(selector).count() > 0) {
      usernameField = selector;
      break;
    }
  }
  
  if (!usernameField) {
    throw new Error('Could not find username field');
  }
  
  // Type username with human-like delays
  await humanType(page, usernameField, MLS_CONFIG.username);
  await randomDelay(500, 1500);
  
  // Look for password field
  const passwordSelectors = [
    'input[name="password"]',
    'input[id*="password"]',
    'input[type="password"]',
    '#password'
  ];
  
  let passwordField = null;
  for (const selector of passwordSelectors) {
    if (await page.locator(selector).count() > 0) {
      passwordField = selector;
      break;
    }
  }
  
  if (!passwordField) {
    throw new Error('Could not find password field');
  }
  
  // Type password
  await humanType(page, passwordField, MLS_CONFIG.password);
  await randomDelay(500, 1500);
  
  // Find and click login button
  const loginButtonSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign In")',
    'input[value="Login"]',
    'input[value="Sign In"]'
  ];
  
  for (const selector of loginButtonSelectors) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        await button.click();
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Wait for navigation after login
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await randomDelay(2000, 4000);
  
  console.log('✅ Login successful!');
}

// Create a search in MLS Matrix
async function createSearch(page: Page, searchCriteria: SearchCriteria) {
  console.log('🔍 Creating search with criteria:', searchCriteria);
  
  // Navigate to search page
  await page.click('text=Search');
  await waitForNetworkIdle(page);
  await randomDelay(1000, 2000);
  
  // Select property type if specified
  if (searchCriteria.propertyType) {
    await page.selectOption('select[name="propertyType"]', searchCriteria.propertyType);
    await randomDelay(500, 1000);
  }
  
  // Set price range
  if (searchCriteria.minPrice) {
    await humanType(page, 'input[name="minPrice"]', searchCriteria.minPrice.toString());
    await randomDelay(300, 600);
  }
  
  if (searchCriteria.maxPrice) {
    await humanType(page, 'input[name="maxPrice"]', searchCriteria.maxPrice.toString());
    await randomDelay(300, 600);
  }
  
  // Set location
  if (searchCriteria.city) {
    await humanType(page, 'input[name="city"]', searchCriteria.city);
    await randomDelay(500, 1000);
  }
  
  if (searchCriteria.zipCode) {
    await humanType(page, 'input[name="zipCode"]', searchCriteria.zipCode);
    await randomDelay(500, 1000);
  }
  
  // Set additional criteria
  if (searchCriteria.minBeds) {
    await page.selectOption('select[name="minBeds"]', searchCriteria.minBeds.toString());
    await randomDelay(300, 600);
  }
  
  if (searchCriteria.minBaths) {
    await page.selectOption('select[name="minBaths"]', searchCriteria.minBaths.toString());
    await randomDelay(300, 600);
  }
  
  // Run the search
  await page.click('button:has-text("Search")');
  await waitForNetworkIdle(page);
  await randomDelay(2000, 4000);
  
  console.log('✅ Search created successfully!');
}

// Download CSV from search results
async function downloadCSV(page: Page, downloadPath: string): Promise<string> {
  console.log('📥 Initiating CSV download...');
  
  // Create download directory
  await fs.promises.mkdir(downloadPath, { recursive: true });
  
  // Start waiting for download before clicking
  const downloadPromise = page.waitForEvent('download', { timeout: MLS_CONFIG.downloadTimeout });
  
  // Look for export/download button
  const exportSelectors = [
    'button:has-text("Export")',
    'button:has-text("Download")',
    'a:has-text("Export")',
    'a:has-text("Download")',
    'button[title*="Export"]',
    'button[title*="Download"]'
  ];
  
  let clicked = false;
  for (const selector of exportSelectors) {
    try {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        await button.click();
        clicked = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  if (!clicked) {
    throw new Error('Could not find export/download button');
  }
  
  await randomDelay(1000, 2000);
  
  // Select CSV format if there's a format selection
  const csvOption = page.locator('text=CSV').first();
  if (await csvOption.isVisible({ timeout: 2000 })) {
    await csvOption.click();
    await randomDelay(500, 1000);
    
    // Confirm download
    const confirmButton = page.locator('button:has-text("Download")').last();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  }
  
  // Wait for download to complete
  const download = await downloadPromise;
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `mls-export-${timestamp}.csv`;
  const filePath = path.join(downloadPath, fileName);
  
  await download.saveAs(filePath);
  console.log(`✅ CSV downloaded successfully to: ${filePath}`);
  
  return filePath;
}

// Main test suite
test.describe('MLS Matrix Automation', () => {
  test.beforeAll(async () => {
    // Validate credentials
    if (!MLS_CONFIG.username || !MLS_CONFIG.password) {
      throw new Error('MLS credentials not found! Please set MLS_USERNAME and MLS_PASSWORD in .env file');
    }
    
    // Create necessary directories
    await createDataDirectories();
  });
  
  test.use({
    // Use stealth browser configuration
    ...test.use,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    headless: MLS_CONFIG.headless,
    launchOptions: {
      slowMo: MLS_CONFIG.slowModeDelay,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    }
  });
  
  test('Search and download MLS data', async ({ browser }) => {
    // Create new context with anti-detection measures
    const context = await browser.newContext();
    await setupMLSContext(context);
    
    const page = await context.newPage();
    
    try {
      // Login to MLS
      await loginToMLS(page);
      
      // Define search criteria
      const searchCriteria: SearchCriteria = {
        propertyType: 'Residential',
        minPrice: 200000,
        maxPrice: 500000,
        city: 'Las Vegas',
        minBeds: 3,
        minBaths: 2
      };
      
      // Create search
      await createSearch(page, searchCriteria);
      
      // Wait for results to load
      await waitForNetworkIdle(page);
      await randomDelay(2000, 4000);
      
      // Take screenshot of results
      await takeTimestampedScreenshot(page, 'mls-search-results');
      
      // Download CSV
      const csvPath = await downloadCSV(page, './data/exports');
      
      // Save search metadata
      await saveToJSON({
        searchCriteria,
        csvPath,
        timestamp: new Date().toISOString(),
        resultsCount: await page.locator('.results-count').textContent()
      }, 'mls-search-metadata');
      
    } catch (error) {
      console.error('❌ Error during MLS automation:', error);
      await takeTimestampedScreenshot(page, 'error-screenshot');
      throw error;
    } finally {
      await context.close();
    }
  });
});

// Type definitions
interface SearchCriteria {
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  zipCode?: string;
  minBeds?: number;
  minBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  listingStatus?: string;
}
