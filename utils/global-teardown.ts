import { FullConfig } from '@playwright/test';

/**
 * Global teardown function that runs after all tests
 * Use this for cleanup tasks like:
 * - Cleaning up test data
 * - Stopping services
 * - Generating reports
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Example cleanup tasks
  // - Remove temporary files
  // - Clean up databases
  // - Stop external services
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;
