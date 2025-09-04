# MLS Matrix Automation Guide

## Overview
This MLS automation tool provides a safe and sophisticated way to automate searches and data downloads from the MLS Matrix system. It includes advanced anti-detection measures to avoid being blocked.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the project root with your MLS credentials:

```env
# MLS Login Credentials
MLS_USERNAME=your_username_here
MLS_PASSWORD=your_password_here

# Optional: Additional Configuration
MLS_BASE_URL=https://matrix.lvar-mls.com/matrix/?f=
DOWNLOAD_WAIT_TIMEOUT=30000
HEADLESS_MODE=false
SLOW_MODE_DELAY=1000
```

### 2. Install Dependencies
```bash
npm install
npx playwright install chromium
```

## Usage

### Basic MLS Automation
Run the main automation script:
```bash
npm run test automation/mls/mls-matrix-automation.spec.ts
```

### Run Examples
```bash
# Run all examples
npm run test automation/mls/example-mls-automation.spec.ts

# Run specific example
npm run test automation/mls/example-mls-automation.spec.ts -g "Example 1"
```

### Run in Headed Mode (see browser)
```bash
npm run test:headed automation/mls/mls-matrix-automation.spec.ts
```

### Run with Stealth Configuration
```bash
npm run test:stealth automation/mls/mls-matrix-automation.spec.ts
```

## Features

### 1. Anti-Detection Measures
- **Realistic Browser Fingerprinting**: Randomizes canvas, audio, and hardware fingerprints
- **Human-like Behavior**: Random delays, mouse movements, and scrolling patterns
- **Session Persistence**: Maintains cookies and session data between runs
- **Rate Limiting**: Intelligent request throttling to avoid triggering limits
- **CAPTCHA Detection**: Alerts when manual intervention is needed
- **Request Monitoring**: Watches for rate limiting and blocking responses

### 2. Search Builder
Create complex searches programmatically:

```typescript
const search = createMLSSearch()
  .withPropertyType(PropertyType.Residential)
  .withPriceRange(300000, 500000)
  .inCity(['Las Vegas', 'Henderson'])
  .withBedrooms(3)
  .withBathrooms(2)
  .withFeatures(PropertyFeature.Pool, PropertyFeature.UpdatedKitchen)
  .activeOnly()
  .build();
```

Use pre-built templates:
```typescript
const search = SearchTemplates.luxuryHome()
  .inCity('Las Vegas')
  .build();
```

### 3. Data Export
- Automatic CSV download from MLS
- JSON export with metadata
- Excel file generation
- Data cleaning and validation
- Summary statistics generation

## Safety Guidelines

1. **Use Reasonable Delays**: The tool includes random delays between actions. Don't reduce these.

2. **Limit Request Frequency**: The rate limiter allows max 30 requests per minute. Don't increase this.

3. **Run During Business Hours**: Avoid running automation during unusual hours (late night/early morning).

4. **Monitor for Blocks**: The tool monitors for 429 (rate limit) and 401/403 (auth) responses. Stop if you see multiple blocks.

5. **Use Headless Mode Sparingly**: Running in headed mode (visible browser) is safer but slower.

6. **Rotate Sessions**: Don't use the same session for extended periods. Clear session data periodically.

## File Structure

```
automation/mls/
├── mls-matrix-automation.spec.ts    # Main automation script
└── example-mls-automation.spec.ts   # Example usage scenarios

utils/
├── mls-anti-detection.ts           # Anti-detection utilities
├── mls-search-builder.ts           # Search query builder
├── browser-utils.ts                # General browser automation utilities
└── data-utils.ts                   # Data handling utilities

data/                               # Output directory
├── exports/                        # Downloaded CSV files
├── screenshots/                    # Screenshots
└── mls-session.json               # Persisted session data
```

## Examples

### Example 1: Simple Search
```typescript
test('Simple property search', async ({ page }) => {
  const search = SearchTemplates.starterHome()
    .inCity('Las Vegas')
    .build();
  // ... automation code
});
```

### Example 2: Batch Searches
```typescript
const searches = [
  { name: 'luxury', builder: SearchTemplates.luxuryHome() },
  { name: 'investment', builder: SearchTemplates.investment() }
];
```

### Example 3: Price Monitoring
Track price changes over time by comparing current data with previous runs.

### Example 4: Custom Search Criteria
Build complex searches with multiple criteria and filters.

## Troubleshooting

### CAPTCHA Appears
- The tool will detect and alert you
- Solve manually within 30 seconds
- Consider reducing automation frequency

### Login Fails
- Verify credentials in .env file
- Check if MLS has changed their login page structure
- Try running in headed mode to see what's happening

### Downloads Not Working
- Ensure `data/exports` directory exists
- Check `DOWNLOAD_WAIT_TIMEOUT` setting
- Verify you have proper permissions in MLS

### Getting Blocked
- Reduce request frequency
- Add longer delays between actions
- Clear session data and start fresh
- Consider running during different hours

## Best Practices

1. **Start Small**: Test with simple searches before complex automation
2. **Monitor Logs**: Watch console output for warnings
3. **Use Screenshots**: Enable screenshots to debug issues
4. **Respect Rate Limits**: Don't try to bypass the built-in limits
5. **Keep It Legal**: Ensure you have permission to automate MLS access
6. **Regular Updates**: MLS sites change; update selectors as needed

## Legal Disclaimer

This tool is for educational purposes and should only be used in compliance with the MLS terms of service. Users are responsible for ensuring they have proper authorization to access and download MLS data. The authors are not responsible for any misuse of this tool.
