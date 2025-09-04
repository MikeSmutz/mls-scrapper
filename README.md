# MLS Scrapper

A specialized web scraper for MLS (Multiple Listing Service) data extraction built with Playwright. This tool is designed to efficiently scrape real estate property listings, market data, and related information from various MLS platforms.

## 🚀 Features

- **MLS Data Extraction**: Specialized scraping for property listings, prices, and market data
- **Multiple Browser Support**: Chrome, Firefox, Safari with headless and headed modes
- **Stealth Mode**: Anti-detection features for web scraping
- **Real Estate Data Export**: JSON, CSV, and Excel export capabilities for property data
- **Property Image Download**: Automatic capture of property photos and virtual tours
- **Market Analysis**: Built-in tools for analyzing real estate trends
- **Geographic Filtering**: Location-based property search and filtering
- **Error Handling**: Robust error handling and retry mechanisms for unreliable MLS sites
- **Performance Optimization**: Efficient scraping with minimal resource usage

## 📁 Project Structure

```
├── automation/                 # MLS scraping automation scripts
│   ├── scraping/               # Property data scraping examples
│   ├── forms/                  # MLS form automation examples  
│   ├── api/                    # MLS API integration examples
│   └── examples/               # Basic MLS scraping examples
├── utils/                      # Utility functions
│   ├── browser-utils.ts        # Browser automation helpers
│   ├── data-utils.ts           # Real estate data handling utilities
│   ├── global-setup.ts         # Global test setup
│   └── global-teardown.ts      # Global test cleanup
├── data/                       # MLS data storage
│   ├── screenshots/            # Property screenshot storage
│   ├── downloads/              # Downloaded property images
│   ├── exports/                # Exported MLS data files
│   └── temp/                   # Temporary files
└── playwright.config.ts        # Playwright configuration
```

## 🛠️ Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/MikeSmutz/mls-scrapper
   cd mls-scrapper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npm run install:browsers
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your specific values
   ```

## 📖 Usage

### Basic Commands

```bash
# Run all automation scripts
npm test

# Run in headed mode (visible browser)
npm run test:headed

# Run in headless mode (default)
npm run test:headless

# Run specific test suite
npm run automation:scrape    # MLS property scraping examples
npm run automation:forms     # MLS form automation examples
npm run automation:api       # MLS API integration examples

# Debug mode
npm run test:debug

# Generate and view reports
npm run test:report
```

### Browser Configurations

The template includes several browser configurations:

- **chromium-headless**: Fast headless Chrome (default)
- **chromium-headed**: Visible Chrome for debugging
- **firefox-headless**: Headless Firefox
- **mobile-chrome**: Mobile viewport simulation
- **stealth-chromium**: Anti-detection Chrome for scraping

```bash
# Run with specific browser
npx playwright test --project=stealth-chromium
```

## 🎯 Examples

### 1. MLS Property Scraping

```typescript
import { test } from '@playwright/test';
import { setStealthMode, waitForNetworkIdle } from '../utils/browser-utils';
import { saveToJSON, cleanScrapedData } from '../utils/data-utils';

test('scrape MLS property listings', async ({ page, context }) => {
  await setStealthMode(context);
  await page.goto('https://example-mls.com/listings');
  
  const properties = await page.$$eval('.property-listing', elements => 
    elements.map(el => ({
      address: el.querySelector('.address')?.textContent?.trim(),
      price: el.querySelector('.price')?.textContent?.trim(),
      bedrooms: el.querySelector('.bedrooms')?.textContent?.trim(),
      bathrooms: el.querySelector('.bathrooms')?.textContent?.trim(),
      squareFeet: el.querySelector('.sqft')?.textContent?.trim(),
      mlsNumber: el.querySelector('.mls-number')?.textContent?.trim(),
      image: el.querySelector('img')?.src
    }))
  );
  
  const cleanedData = cleanScrapedData(properties);
  await saveToJSON(cleanedData, 'mls-properties');
});
```

### 2. MLS Search Form Automation

```typescript
import { test } from '@playwright/test';
import { humanType, randomDelay } from '../utils/browser-utils';

test('search MLS properties by criteria', async ({ page }) => {
  await page.goto('https://example-mls.com/search');
  
  await humanType(page, '#location', 'San Francisco, CA');
  await randomDelay();
  
  await humanType(page, '#min-price', '500000');
  await randomDelay();
  
  await humanType(page, '#max-price', '1000000');
  await randomDelay();
  
  await page.selectOption('#bedrooms', '3');
  await page.click('#search-button');
});
```

### 3. MLS API Integration

```typescript
import { test, expect } from '@playwright/test';

test('MLS API property data test', async ({ request }) => {
  const response = await request.get('/api/properties?location=San Francisco');
  expect(response.status()).toBe(200);
  
  const properties = await response.json();
  expect(properties).toHaveLength(10);
  expect(properties[0]).toHaveProperty('mlsNumber');
  expect(properties[0]).toHaveProperty('price');
});
```

## 🔧 Utility Functions

### Browser Utils

- `setStealthMode(context)` - Enable anti-detection features
- `handleCookieConsent(page)` - Automatically handle cookie banners
- `waitForNetworkIdle(page)` - Wait for network requests to complete
- `scrollToBottom(page)` - Handle infinite scroll pages
- `takeTimestampedScreenshot(page, name)` - Capture screenshots
- `humanType(page, selector, text)` - Type with human-like delays
- `randomDelay(min, max)` - Add random delays

### Data Utils

- `saveToJSON(data, filename)` - Export MLS data to JSON
- `saveToCSV(data, filename)` - Export property data to CSV  
- `saveToExcel(data, filename)` - Export MLS data to Excel
- `cleanScrapedData(data)` - Clean and validate scraped property data
- `generateDataSummary(data)` - Generate real estate market summary statistics

## 🎨 Configuration

### Environment Variables

Create a `.env` file with your configuration:

```bash
# Browser settings
HEADLESS=true
BROWSER_TIMEOUT=30000
SLOW_MO=0

# MLS API settings
MLS_API_BASE_URL=https://api.mls-provider.com
MLS_API_TIMEOUT=30000

# MLS Authentication
MLS_USERNAME=your-mls-username
MLS_PASSWORD=your-mls-password
MLS_API_KEY=your-mls-api-key

# Search parameters
DEFAULT_LOCATION=San Francisco, CA
MIN_PRICE=0
MAX_PRICE=10000000
```

### Playwright Configuration

The `playwright.config.ts` file is optimized for MLS scraping:

- Multiple browser configurations for different MLS platforms
- Performance optimizations for large property datasets
- Screenshot and video capture for property listings
- Network request blocking for faster scraping
- Custom timeouts and retry logic for unreliable MLS sites

## 📊 Data Export

All MLS scraping scripts can export property data in multiple formats:

```typescript
// Export property data to JSON
await saveToJSON(properties, 'mls-properties');

// Export to CSV for analysis
await saveToCSV(properties, 'property-listings'); 

// Export to Excel with multiple sheets
await saveToExcel(properties, 'mls-data', 'Properties');
```

MLS data is automatically saved to the `data/` directory with timestamps.

## 🐛 Debugging

### Visual Debugging

```bash
# Run in headed mode
npm run test:headed

# Run in debug mode (step through)  
npm run test:debug

# Record videos
RECORD_VIDEO=true npm test
```

### Screenshots

Screenshots are automatically taken on failures. Manual screenshots:

```typescript
await takeTimestampedScreenshot(page, 'debug-point');
```

### Traces

View execution traces:

```bash
npm run test:trace
```

## 🔍 Best Practices

### 1. Stealth Mode for MLS Scraping

```typescript
// Enable anti-detection for MLS sites
await setStealthMode(context);

// Use realistic delays to avoid detection
await randomDelay(1000, 3000);

// Human-like typing for search forms
await humanType(page, '#location', 'San Francisco, CA');
```

### 2. Error Handling

```typescript
try {
  await page.click('#button', { timeout: 5000 });
} catch (error) {
  console.log('Button not found, trying alternative');
  await page.click('#alt-button');
}
```

### 3. Performance Optimization for MLS Data

```typescript
// Block unnecessary resources for faster scraping
await blockUnnecessaryResources(page);

// Wait for network idle instead of fixed delays
await waitForNetworkIdle(page);

// Handle pagination efficiently
await handleMLSPagination(page);
```

### 4. MLS Data Validation

```typescript
// Clean scraped property data
const cleanedData = cleanScrapedData(rawPropertyData);

// Validate MLS data before saving
if (cleanedData.length > 0) {
  await saveToJSON(cleanedData, 'mls-properties');
}
```

## 📱 Mobile Testing

Test mobile viewports:

```bash
npm run test:mobile
```

Or in code:

```typescript
test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
```

## 🔒 MLS Authentication

Handle MLS login flows:

```typescript
// Save MLS authentication state
await page.goto('/mls-login');
await page.fill('#username', process.env.MLS_USERNAME);
await page.fill('#password', process.env.MLS_PASSWORD);
await page.click('#login');

await page.context().storageState({ path: 'mls-auth.json' });
```

Use saved MLS authentication:

```typescript
test.use({ storageState: 'mls-auth.json' });
```

## 🚨 Common Issues

### 1. MLS Anti-Bot Detection
- Use `setStealthMode(context)` for MLS sites
- Add random delays between requests
- Rotate user agents and IP addresses
- Use residential proxies for large-scale scraping

### 2. MLS Site Timeouts
- Increase timeouts for slow MLS sites
- Use `waitForNetworkIdle()` for dynamic property listings
- Wait for specific elements instead of fixed delays

### 3. MLS Element Not Found
- Use multiple selectors as fallbacks for different MLS platforms
- Wait for property listing elements to appear
- Handle dynamic MLS content with proper waits

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [CSS Selectors Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [XPath Tutorial](https://www.w3schools.com/xml/xpath_intro.asp)
- [MLS Data Standards](https://www.reso.org/)
- [Real Estate Data Formats](https://www.reso.org/standards/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the [common issues](#-common-issues) section
2. Review the Playwright documentation
3. Create an issue in this repository

---

**Happy MLS Scraping! 🏠**
