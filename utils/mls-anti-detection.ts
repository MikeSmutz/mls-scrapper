import { Page, BrowserContext } from '@playwright/test';
import { randomDelay } from './browser-utils';

/**
 * Advanced anti-detection utilities specifically for MLS systems
 */

/**
 * Simulate human-like mouse movements
 */
export async function simulateMouseMovement(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  if (!viewport) return;
  
  // Generate random points for mouse movement
  const points = [];
  const numPoints = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: Math.floor(Math.random() * viewport.width * 0.8) + viewport.width * 0.1,
      y: Math.floor(Math.random() * viewport.height * 0.8) + viewport.height * 0.1
    });
  }
  
  // Move mouse through points with natural curves
  for (const point of points) {
    await page.mouse.move(point.x, point.y, { steps: 10 + Math.floor(Math.random() * 10) });
    await randomDelay(100, 300);
  }
}

/**
 * Simulate human-like scrolling patterns
 */
export async function humanScroll(page: Page): Promise<void> {
  const scrolls = 2 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < scrolls; i++) {
    const scrollAmount = 100 + Math.floor(Math.random() * 300);
    await page.mouse.wheel(0, scrollAmount);
    await randomDelay(500, 1500);
    
    // Occasionally scroll up a bit
    if (Math.random() > 0.7) {
      await page.mouse.wheel(0, -scrollAmount / 2);
      await randomDelay(300, 800);
    }
  }
}

/**
 * Add realistic browser fingerprint
 */
export async function setupRealisticFingerprint(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    // Randomize canvas fingerprint
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type: any, ...args: any[]) {
      const context = originalGetContext.apply(this, [type, ...args]);
      if (type === '2d' && context) {
        const originalFillText = context.fillText;
        context.fillText = function(...args: any[]) {
          args[1] = args[1] + Math.random() * 0.1;
          return originalFillText.apply(this, args);
        };
      }
      return context;
    };
    
    // Randomize audio context
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const originalCreateOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function() {
        const oscillator = originalCreateOscillator.apply(this);
        const originalFrequency = oscillator.frequency.value;
        oscillator.frequency.value = originalFrequency * (1 + Math.random() * 0.0001);
        return oscillator;
      };
    }
    
    // Add realistic screen properties
    Object.defineProperty(screen, 'availWidth', {
      get: () => screen.width - Math.floor(Math.random() * 10)
    });
    
    Object.defineProperty(screen, 'availHeight', {
      get: () => screen.height - Math.floor(Math.random() * 40) - 40
    });
    
    // Add battery API
    (navigator as any).getBattery = () => Promise.resolve({
      charging: Math.random() > 0.5,
      chargingTime: Math.random() > 0.5 ? Infinity : Math.floor(Math.random() * 3600),
      dischargingTime: Math.floor(Math.random() * 10800) + 3600,
      level: 0.5 + Math.random() * 0.5
    });
    
    // Randomize hardware concurrency
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => [2, 4, 8, 16][Math.floor(Math.random() * 4)]
    });
    
    // Add realistic plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const plugins = [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' }
        ];
        return Object.assign(plugins, { length: plugins.length });
      }
    });
  });
}

/**
 * Implement session persistence
 */
export async function persistSession(context: BrowserContext, sessionPath: string): Promise<void> {
  // Save storage state including cookies and local storage
  await context.storageState({ path: sessionPath });
}

/**
 * Load persisted session
 */
export async function loadSession(sessionPath: string): Promise<any> {
  try {
    const fs = await import('fs');
    if (fs.existsSync(sessionPath)) {
      return JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
    }
  } catch (error) {
    console.warn('Could not load session:', error);
  }
  return null;
}

/**
 * Implement intelligent rate limiting
 */
export class RateLimiter {
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly resetInterval: number = 60000; // 1 minute
  private readonly maxRequests: number = 30;
  private resetTimer?: NodeJS.Timeout;
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Reset counter if interval has passed
    if (now - this.lastRequestTime > this.resetInterval) {
      this.requestCount = 0;
    }
    
    // Check if we've hit the limit
    if (this.requestCount >= this.maxRequests) {
      const waitTime = this.resetInterval - (now - this.lastRequestTime);
      console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
    }
    
    // Add natural delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 2000) {
      await randomDelay(2000 - timeSinceLastRequest, 4000);
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }
}

/**
 * Detect and handle CAPTCHA challenges
 */
export async function detectCaptcha(page: Page): Promise<boolean> {
  const captchaSelectors = [
    'iframe[src*="recaptcha"]',
    'iframe[src*="captcha"]',
    '.g-recaptcha',
    '#captcha',
    '[class*="captcha"]',
    'img[src*="captcha"]'
  ];
  
  for (const selector of captchaSelectors) {
    if (await page.locator(selector).count() > 0) {
      console.warn('⚠️  CAPTCHA detected! Manual intervention may be required.');
      return true;
    }
  }
  
  return false;
}

/**
 * Handle session timeout with automatic re-login
 */
export async function handleSessionTimeout(
  page: Page, 
  checkLoggedIn: () => Promise<boolean>,
  reLogin: () => Promise<void>
): Promise<void> {
  const isLoggedIn = await checkLoggedIn();
  
  if (!isLoggedIn) {
    console.log('🔄 Session expired. Re-authenticating...');
    await reLogin();
  }
}

/**
 * Implement mouse jiggler to prevent idle detection
 */
export async function startMouseJiggler(page: Page, intervalMs: number = 30000): Promise<NodeJS.Timer> {
  return setInterval(async () => {
    try {
      const viewport = page.viewportSize();
      if (viewport) {
        const x = Math.floor(Math.random() * viewport.width);
        const y = Math.floor(Math.random() * viewport.height);
        await page.mouse.move(x, y, { steps: 5 });
      }
    } catch (error) {
      // Page might be closed
    }
  }, intervalMs);
}

/**
 * Implement request interception for monitoring
 */
export async function setupRequestMonitoring(page: Page): Promise<void> {
  let blockedRequests = 0;
  
  page.on('response', async (response) => {
    // Monitor for rate limiting responses
    if (response.status() === 429) {
      console.warn('⚠️  Rate limit response detected (429). Slowing down...');
      await randomDelay(30000, 60000); // Wait 30-60 seconds
    }
    
    // Monitor for authentication issues
    if (response.status() === 401 || response.status() === 403) {
      console.warn('⚠️  Authentication issue detected. May need to re-login.');
    }
    
    // Check for blocking patterns
    const url = response.url();
    if (url.includes('/blocked') || url.includes('/denied')) {
      blockedRequests++;
      if (blockedRequests > 3) {
        console.error('❌ Multiple blocked requests detected. Stopping automation.');
        throw new Error('Automation detected and blocked');
      }
    }
  });
}

/**
 * Generate realistic user behavior patterns
 */
export async function simulateRealisticBehavior(page: Page): Promise<void> {
  const actions = [
    async () => await simulateMouseMovement(page),
    async () => await humanScroll(page),
    async () => await page.keyboard.press('Tab'),
    async () => await page.keyboard.press('Escape'),
    async () => {
      // Random click on page
      const viewport = page.viewportSize();
      if (viewport) {
        const x = Math.floor(Math.random() * viewport.width * 0.8) + viewport.width * 0.1;
        const y = Math.floor(Math.random() * viewport.height * 0.8) + viewport.height * 0.1;
        await page.mouse.click(x, y);
      }
    }
  ];
  
  // Perform 1-3 random actions
  const numActions = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numActions; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    await action();
    await randomDelay(500, 2000);
  }
}
