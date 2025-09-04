# 🚀 Quick Start Guide

Get up and running with MLS scraping in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
npm run install:browsers
```

## Step 2: Run Your First MLS Test

```bash
# Run a basic MLS automation example
npx playwright test automation/examples/basic-examples.spec.ts --project=chromium-headless --grep "Navigate and interact"
```

## Step 3: Try MLS Property Scraping

```bash
# Run MLS property scraping example
npx playwright test automation/scraping/basic-scraping.spec.ts --project=stealth-chromium --grep "property listings"
```

## Step 4: Test MLS Form Automation

```bash
# Run MLS search form automation example
npx playwright test automation/forms/form-automation.spec.ts --project=chromium-headed --grep "property search"
```

## Step 5: View MLS Results

```bash
# View test report
npm run test:report

# Check generated MLS data
ls data/
```

## 🎯 Common Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:headed` | Run with visible browser |
| `npm run test:debug` | Debug mode |
| `npm run codegen` | Record new automation |
| `npm run test:ui` | Interactive test runner |

## 🔧 Quick Tips

1. **Start with headed mode** for debugging: `--project=chromium-headed`
2. **Use stealth mode** for MLS scraping: `--project=stealth-chromium`
3. **Run specific tests** with: `--grep "test name"`
4. **Generate new MLS tests** with: `npm run codegen https://example-mls.com`

## 📁 Project Structure Overview

```
automation/
├── examples/     ← Start here for basic MLS automation
├── scraping/     ← MLS property scraping examples
├── forms/        ← MLS form automation examples
└── api/          ← MLS API integration examples

utils/            ← Helper functions
data/             ← Generated MLS data and screenshots
```

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Run `npx playwright test --help` for command options
- View traces with `npx playwright show-trace test-results/[test-folder]/trace.zip`

Happy MLS scraping! 🏠
