import { test, expect } from '@playwright/test';
import { 
  handleCookieConsent, 
  waitForNetworkIdle, 
  takeTimestampedScreenshot,
  scrollToBottom,
  setStealthMode 
} from '../../utils/browser-utils';
import { saveToJSON, saveToCSV, cleanScrapedData } from '../../utils/data-utils';

test.describe('Basic Web Scraping Examples', () => {
  
  test('Scrape news headlines from a website', async ({ page, context }) => {
    // Enable stealth mode
    await setStealthMode(context);
    
    // Navigate to a news website (example: BBC News)
    await page.goto('https://www.bbc.com/news');
    
    // Handle cookie consent
    await handleCookieConsent(page);
    
    // Wait for content to load
    await waitForNetworkIdle(page);
    
    // Take screenshot for verification
    await takeTimestampedScreenshot(page, 'bbc-news-homepage');
    
    // Scrape headlines
    const headlines = await page.$$eval('h3', (elements) => 
      elements.map(el => ({
        title: el.textContent?.trim() || '',
        link: el.closest('a')?.getAttribute('href') || '',
        timestamp: new Date().toISOString()
      })).filter(item => item.title.length > 0)
    );
    
    // Clean the scraped data
    const cleanedHeadlines = cleanScrapedData(headlines);
    
    // Save data
    await saveToJSON(cleanedHeadlines, 'bbc-headlines');
    await saveToCSV(cleanedHeadlines, 'bbc-headlines');
    
    // Assertions
    expect(cleanedHeadlines.length).toBeGreaterThan(0);
    console.log(`📰 Scraped ${cleanedHeadlines.length} headlines`);
  });
  
  test('Scrape product information from an e-commerce site', async ({ page, context }) => {
    await setStealthMode(context);
    
    // Example: Scraping from a demo e-commerce site
    await page.goto('https://webscraper.io/test-sites/e-commerce/allinone');
    
    await waitForNetworkIdle(page);
    
    // Navigate to computers category
    await page.click('a[href*="computers"]');
    await waitForNetworkIdle(page);
    
    // Scrape product information
    const products = await page.$$eval('.thumbnail', (elements) => 
      elements.map(el => {
        const title = el.querySelector('.title')?.textContent?.trim() || '';
        const price = el.querySelector('.price')?.textContent?.trim() || '';
        const description = el.querySelector('.description')?.textContent?.trim() || '';
        const link = el.querySelector('a')?.getAttribute('href') || '';
        
        return {
          title,
          price,
          description,
          link: link ? new URL(link, window.location.origin).href : '',
          scrapedAt: new Date().toISOString()
        };
      }).filter(item => item.title.length > 0)
    );
    
    const cleanedProducts = cleanScrapedData(products);
    
    await saveToJSON(cleanedProducts, 'ecommerce-products');
    await saveToCSV(cleanedProducts, 'ecommerce-products');
    
    expect(cleanedProducts.length).toBeGreaterThan(0);
    console.log(`🛍️ Scraped ${cleanedProducts.length} products`);
  });
  
  test('Scrape infinite scroll content', async ({ page, context }) => {
    await setStealthMode(context);
    
    // Example with a site that has infinite scroll
    await page.goto('https://quotes.toscrape.com/scroll');
    
    await waitForNetworkIdle(page);
    
    // Scroll to load more content
    await scrollToBottom(page, 5); // Scroll 5 times max
    
    // Scrape all quotes
    const quotes = await page.$$eval('.quote', (elements) => 
      elements.map(el => {
        const text = el.querySelector('.text')?.textContent?.trim() || '';
        const author = el.querySelector('.author')?.textContent?.trim() || '';
        const tags = Array.from(el.querySelectorAll('.tag')).map(tag => 
          tag.textContent?.trim() || ''
        );
        
        return {
          text: text.replace(/^"|"$/g, ''), // Remove surrounding quotes
          author,
          tags,
          scrapedAt: new Date().toISOString()
        };
      }).filter(item => item.text.length > 0)
    );
    
    const cleanedQuotes = cleanScrapedData(quotes);
    
    await saveToJSON(cleanedQuotes, 'quotes');
    await saveToCSV(cleanedQuotes, 'quotes');
    
    expect(cleanedQuotes.length).toBeGreaterThan(0);
    console.log(`💭 Scraped ${cleanedQuotes.length} quotes`);
  });
  
  test('Scrape data from multiple pages', async ({ page, context }) => {
    await setStealthMode(context);
    
    const allData: any[] = [];
    const baseUrl = 'https://quotes.toscrape.com/page/';
    const maxPages = 3;
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`📄 Scraping page ${pageNum}...`);
      
      await page.goto(`${baseUrl}${pageNum}`);
      await waitForNetworkIdle(page);
      
      // Check if we've reached the last page
      const nextButton = page.locator('li.next a');
      const hasNextPage = await nextButton.isVisible();
      
      // Scrape quotes from current page
      const pageQuotes = await page.$$eval('.quote', (elements) => 
        elements.map(el => {
          const text = el.querySelector('.text')?.textContent?.trim() || '';
          const author = el.querySelector('.author')?.textContent?.trim() || '';
          const tags = Array.from(el.querySelectorAll('.tag')).map(tag => 
            tag.textContent?.trim() || ''
          );
          
          return {
            text: text.replace(/^"|"$/g, ''),
            author,
            tags,
            page: parseInt(new URL(window.location.href).pathname.split('/').pop() || '1'),
            scrapedAt: new Date().toISOString()
          };
        }).filter(item => item.text.length > 0)
      );
      
      allData.push(...pageQuotes);
      
      // Break if no more pages
      if (!hasNextPage) {
        console.log(`📄 Reached last page at page ${pageNum}`);
        break;
      }
      
      // Random delay between pages to avoid rate limiting
      await page.waitForTimeout(Math.random() * 2000 + 1000);
    }
    
    const cleanedData = cleanScrapedData(allData);
    
    await saveToJSON(cleanedData, 'multi-page-quotes');
    await saveToCSV(cleanedData, 'multi-page-quotes');
    
    expect(cleanedData.length).toBeGreaterThan(0);
    console.log(`📚 Scraped ${cleanedData.length} quotes from multiple pages`);
  });
});
