import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { 
  setStealthMode, 
  randomDelay, 
  humanType, 
  waitForNetworkIdle,
  takeTimestampedScreenshot,
  simulateMouseMovement,
  humanScroll
} from '../../utils/browser-utils';
import { 
  setupRealisticFingerprint,
  RateLimiter,
  detectCaptcha,
  startMouseJiggler,
  setupRequestMonitoring,
  simulateRealisticBehavior,
  persistSession,
  loadSession
} from '../../utils/mls-anti-detection';
import { saveToJSON, saveToCSV, cleanScrapedData, generateDataSummary } from '../../utils/data-utils';
import { createMLSSearch, SearchTemplates, PropertyType, PropertyFeature } from '../../utils/mls-search-builder';

/**
 * Example MLS automation scripts demonstrating various use cases
 */

// Configuration
const MLS_CONFIG = {
  baseUrl: process.env.MLS_BASE_URL || 'https://matrix.lvar-mls.com/matrix/?f=',
  username: process.env.MLS_USERNAME || '',
  password: process.env.MLS_PASSWORD || '',
  sessionFile: './data/mls-session.json',
  headless: process.env.HEADLESS_MODE === 'true'
};

// Initialize rate limiter
const rateLimiter = new RateLimiter();

test.describe('MLS Automation Examples', () => {
  test.beforeAll(async () => {
    if (!MLS_CONFIG.username || !MLS_CONFIG.password) {
      throw new Error('Please set MLS_USERNAME and MLS_PASSWORD in .env file');
    }
  });
  
  test('Example 1: Simple property search with anti-detection', async ({ browser }) => {
    // Create context with persisted session
    const sessionData = await loadSession(MLS_CONFIG.sessionFile);
    const context = await browser.newContext(sessionData || {});
    
    // Apply all anti-detection measures
    await setupRealisticFingerprint(context);
    await setStealthMode(context);
    
    const page = await context.newPage();
    await setupRequestMonitoring(page);
    
    // Start mouse jiggler
    const jiggler = startMouseJiggler(page);
    
    try {
      // Rate limit check
      await rateLimiter.waitIfNeeded();
      
      // Navigate with realistic behavior
      await page.goto(MLS_CONFIG.baseUrl);
      await simulateRealisticBehavior(page);
      
      // Check for CAPTCHA
      if (await detectCaptcha(page)) {
        console.log('CAPTCHA detected - manual intervention needed');
        // Wait for manual CAPTCHA solving
        await page.waitForTimeout(30000);
      }
      
      // Login if needed (implementation would go here)
      console.log('🏠 Searching for starter homes...');
      
      // Use search template
      const search = SearchTemplates.starterHome()
        .inCity('Las Vegas')
        .build();
      
      console.log('Search criteria:', search);
      console.log('Description:', SearchTemplates.starterHome().inCity('Las Vegas').toDescription());
      
      // Perform search (implementation details would go here)
      await randomDelay(2000, 4000);
      
      // Save session for next run
      await persistSession(context, MLS_CONFIG.sessionFile);
      
    } finally {
      clearInterval(jiggler);
      await context.close();
    }
  });
  
  test('Example 2: Advanced search with custom criteria', async ({ browser }) => {
    const context = await browser.newContext();
    await setupRealisticFingerprint(context);
    await setStealthMode(context);
    
    const page = await context.newPage();
    
    try {
      await rateLimiter.waitIfNeeded();
      await page.goto(MLS_CONFIG.baseUrl);
      
      // Build custom search
      const customSearch = createMLSSearch()
        .withPropertyType([PropertyType.Residential, PropertyType.Condo])
        .withPriceRange(250000, 450000)
        .inCity(['Las Vegas', 'Henderson', 'North Las Vegas'])
        .withBedrooms(3)
        .withBathrooms(2)
        .withSquareFeet(1500, 2500)
        .withFeatures(
          PropertyFeature.AirConditioning,
          PropertyFeature.UpdatedKitchen
        )
        .withMaxHOA(200)
        .withKeywords('move-in ready', 'renovated')
        .excludingKeywords('fixer', 'as-is')
        .activeOnly()
        .build();
      
      console.log('🔍 Custom search:', customSearch);
      console.log('URL params:', createMLSSearch().withPriceRange(250000, 450000).toUrlParams().toString());
      
      // Simulate human behavior while searching
      await humanScroll(page);
      await simulateMouseMovement(page);
      
    } finally {
      await context.close();
    }
  });
  
  test('Example 3: Batch search and data collection', async ({ browser }) => {
    const context = await browser.newContext();
    await setupRealisticFingerprint(context);
    await setStealthMode(context);
    
    const page = await context.newPage();
    const allResults = [];
    
    try {
      // Define multiple searches
      const searches = [
        {
          name: 'luxury-homes',
          builder: SearchTemplates.luxuryHome().inCity('Las Vegas')
        },
        {
          name: 'investment-properties',
          builder: SearchTemplates.investment().withMaxPrice(400000)
        },
        {
          name: 'vacant-land',
          builder: SearchTemplates.land().inCounty('Clark County')
        }
      ];
      
      // Process each search
      for (const searchConfig of searches) {
        console.log(`\n📊 Processing search: ${searchConfig.name}`);
        console.log(`Description: ${searchConfig.builder.toDescription()}`);
        
        await rateLimiter.waitIfNeeded();
        
        // Simulate the search (actual implementation would go here)
        const mockResults = generateMockResults(searchConfig.name, 10);
        allResults.push(...mockResults);
        
        // Human-like behavior between searches
        await randomDelay(5000, 10000);
        await simulateRealisticBehavior(page);
        
        // Take screenshot
        await takeTimestampedScreenshot(page, `search-${searchConfig.name}`);
      }
      
      // Clean and save all results
      const cleanedData = cleanScrapedData(allResults);
      const summary = generateDataSummary(cleanedData);
      
      // Save in multiple formats
      await saveToJSON(cleanedData, 'mls-batch-results');
      await saveToCSV(cleanedData, 'mls-batch-results');
      await saveToJSON(summary, 'mls-batch-summary');
      
      console.log('\n✅ Batch search completed!');
      console.log(`Total properties found: ${cleanedData.length}`);
      
    } finally {
      await context.close();
    }
  });
  
  test('Example 4: Monitoring price changes', async ({ browser }) => {
    const context = await browser.newContext();
    await setupRealisticFingerprint(context);
    
    const page = await context.newPage();
    
    try {
      // Load previous data if exists
      const previousDataPath = './data/price-monitoring-previous.json';
      let previousData = [];
      
      if (fs.existsSync(previousDataPath)) {
        previousData = JSON.parse(fs.readFileSync(previousDataPath, 'utf-8'));
      }
      
      // Search for properties we're monitoring
      const monitoringSearch = createMLSSearch()
        .withPropertyType(PropertyType.Residential)
        .inZipCode(['89135', '89134', '89138'])
        .withPriceRange(300000, 500000)
        .activeOnly()
        .build();
      
      console.log('💰 Monitoring price changes for:', monitoringSearch);
      
      // Get current data (mock)
      const currentData = generateMockResults('monitoring', 20);
      
      // Compare prices
      const priceChanges = [];
      for (const current of currentData) {
        const previous = previousData.find((p: any) => p.mlsNumber === current.mlsNumber);
        if (previous && previous.price !== current.price) {
          priceChanges.push({
            mlsNumber: current.mlsNumber,
            address: current.address,
            previousPrice: previous.price,
            currentPrice: current.price,
            change: current.price - previous.price,
            changePercent: ((current.price - previous.price) / previous.price * 100).toFixed(2)
          });
        }
      }
      
      // Save results
      if (priceChanges.length > 0) {
        console.log(`📉 Found ${priceChanges.length} price changes!`);
        await saveToJSON(priceChanges, 'price-changes');
        await saveToCSV(priceChanges, 'price-changes');
      }
      
      // Save current data for next comparison
      await fs.promises.writeFile(previousDataPath, JSON.stringify(currentData, null, 2));
      
    } finally {
      await context.close();
    }
  });
});

// Helper function to generate mock results for examples
function generateMockResults(searchName: string, count: number): any[] {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push({
      mlsNumber: `LV${Date.now()}${i}`,
      address: `${1000 + i} Example St, Las Vegas, NV 89${100 + i}`,
      price: Math.floor(Math.random() * 500000) + 200000,
      beds: Math.floor(Math.random() * 4) + 2,
      baths: Math.floor(Math.random() * 3) + 1,
      sqft: Math.floor(Math.random() * 2000) + 1500,
      yearBuilt: Math.floor(Math.random() * 30) + 1990,
      listingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      searchName
    });
  }
  return results;
}

// Test configuration for examples
test.use({
  // Extended timeout for examples
  timeout: 120000,
  
  // Video recording for debugging
  video: 'on',
  
  // Browser options
  launchOptions: {
    slowMo: 500,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--no-sandbox'
    ]
  }
});
