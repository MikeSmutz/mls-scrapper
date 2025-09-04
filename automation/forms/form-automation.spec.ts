import { test, expect } from '@playwright/test';
import { 
  handleCookieConsent, 
  humanType, 
  randomDelay, 
  takeTimestampedScreenshot 
} from '../../utils/browser-utils';
import { saveToJSON } from '../../utils/data-utils';

test.describe('Form Automation Examples', () => {
  
  test('Fill out contact form with validation', async ({ page }) => {
    // Navigate to a demo contact form
    await page.goto('https://www.selenium.dev/selenium/web/web-form.html');
    
    await handleCookieConsent(page);
    
    // Take screenshot before filling
    await takeTimestampedScreenshot(page, 'contact-form-before');
    
    // Fill form fields with human-like typing
    await humanType(page, '#my-text-id', 'John Doe');
    await randomDelay();
    
    await humanType(page, '[name="my-password"]', 'SecurePassword123!');
    await randomDelay();
    
    await humanType(page, '[name="my-textarea"]', 'This is a test message for automation purposes.');
    await randomDelay();
    
    // Handle dropdown
    await page.selectOption('[name="my-select"]', 'Two');
    await randomDelay();
    
    // Handle checkboxes and radio buttons
    await page.check('[name="my-check-1"]');
    await page.check('[name="my-radio"][value="radio1"]');
    await randomDelay();
    
    // Handle file upload (create a test file first)
    const testFileContent = 'This is a test file for automation';
    await page.setInputFiles('[name="my-file"]', {
      name: 'test-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(testFileContent)
    });
    await randomDelay();
    
    // Handle date picker
    await page.fill('[name="my-date"]', '2024-12-25');
    await randomDelay();
    
    // Handle range slider
    await page.fill('[name="my-range"]', '7');
    await randomDelay();
    
    // Take screenshot after filling
    await takeTimestampedScreenshot(page, 'contact-form-filled');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await page.waitForSelector('h1', { state: 'visible' });
    
    // Verify success
    const successMessage = await page.textContent('h1');
    expect(successMessage).toContain('Form submitted');
    
    // Take screenshot of result
    await takeTimestampedScreenshot(page, 'contact-form-success');
    
    // Save form data for records
    const formData = {
      textInput: 'John Doe',
      password: '[HIDDEN]',
      textarea: 'This is a test message for automation purposes.',
      dropdown: 'Two',
      checkbox: true,
      radio: 'radio1',
      fileName: 'test-file.txt',
      date: '2024-12-25',
      range: '7',
      submittedAt: new Date().toISOString(),
      success: true
    };
    
    await saveToJSON(formData, 'form-submission');
    
    console.log('✅ Form submitted successfully');
  });
  
  test('Handle dynamic form with conditional fields', async ({ page }) => {
    // Navigate to a more complex form demo
    await page.goto('https://demoqa.com/automation-practice-form');
    
    await handleCookieConsent(page);
    
    // Fill basic information
    await humanType(page, '#firstName', 'Jane');
    await humanType(page, '#lastName', 'Smith');
    await humanType(page, '#userEmail', 'jane.smith@example.com');
    
    // Select gender (this might show/hide other fields)
    await page.click('label[for="gender-radio-2"]'); // Female
    await randomDelay();
    
    await humanType(page, '#userNumber', '1234567890');
    
    // Handle date picker
    await page.click('#dateOfBirthInput');
    await page.selectOption('.react-datepicker__month-select', '5'); // June
    await page.selectOption('.react-datepicker__year-select', '1990');
    await page.click('.react-datepicker__day--015'); // 15th
    await randomDelay();
    
    // Handle autocomplete field for subjects
    await page.click('#subjectsInput');
    await page.keyboard.type('Math');
    await page.keyboard.press('Enter');
    await randomDelay();
    
    // Handle checkboxes for hobbies
    await page.check('label[for="hobbies-checkbox-2"]'); // Reading
    await randomDelay();
    
    // Upload picture
    await page.setInputFiles('#uploadPicture', {
      name: 'profile.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    });
    
    // Fill address
    await humanType(page, '#currentAddress', '123 Main Street\\nAnytown, ST 12345');
    
    // Handle state and city dropdowns (cascading)
    await page.click('#state');
    await page.click('div[id*="option-0"]');
    await randomDelay();
    
    await page.click('#city');
    await page.click('div[id*="option-0"]');
    await randomDelay();
    
    // Take screenshot before submit
    await takeTimestampedScreenshot(page, 'practice-form-filled');
    
    // Submit form
    await page.click('#submit');
    
    // Handle potential modal
    try {
      await page.waitForSelector('.modal-content', { timeout: 5000 });
      await takeTimestampedScreenshot(page, 'form-modal-result');
      
      // Close modal
      await page.click('#closeLargeModal');
      console.log('✅ Form submitted with modal confirmation');
    } catch (error) {
      console.log('ℹ️ No modal appeared, form might not have submitted');
    }
  });
  
  test('Multi-step form automation', async ({ page }) => {
    // Example of a multi-step form
    await page.goto('https://www.w3schools.com/howto/howto_js_form_steps.html');
    
    await handleCookieConsent(page);
    
    const steps = [
      {
        stepName: 'Personal Information',
        fields: {
          '#fname': 'John',
          '#lname': 'Doe',
          '#email': 'john.doe@example.com'
        }
      },
      {
        stepName: 'Contact Information',
        fields: {
          '#phone': '+1-555-123-4567',
          '#address': '123 Main St'
        }
      },
      {
        stepName: 'Account Information',
        fields: {
          '#username': 'johndoe123',
          '#password': 'SecurePass123!'
        }
      }
    ];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`📝 Filling step ${i + 1}: ${step.stepName}`);
      
      // Fill fields for current step
      for (const [selector, value] of Object.entries(step.fields)) {
        try {
          await humanType(page, selector, value);
          await randomDelay(200, 500);
        } catch (error) {
          console.log(`⚠️ Could not fill field ${selector}: ${error}`);
        }
      }
      
      // Take screenshot of current step
      await takeTimestampedScreenshot(page, `multi-step-form-step-${i + 1}`);
      
      // Click next button (except for last step)
      if (i < steps.length - 1) {
        try {
          await page.click('button:has-text("Next")');
          await randomDelay();
        } catch (error) {
          console.log(`⚠️ Could not click Next button: ${error}`);
          break;
        }
      } else {
        // Submit on last step
        try {
          await page.click('button:has-text("Submit")');
          await randomDelay();
        } catch (error) {
          console.log(`⚠️ Could not submit form: ${error}`);
        }
      }
    }
    
    console.log('✅ Multi-step form automation completed');
  });
  
  test('Form validation testing', async ({ page }) => {
    await page.goto('https://www.selenium.dev/selenium/web/web-form.html');
    
    // Test empty form submission
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    const requiredFields = await page.$$eval('input[required]', (elements) => 
      elements.map(el => ({
        name: el.getAttribute('name') || el.getAttribute('id') || 'unknown',
        isValid: el.checkValidity(),
        validationMessage: el.validationMessage
      }))
    );
    
    console.log('🔍 Validation results:', requiredFields);
    
    // Test invalid email format
    await humanType(page, '#my-text-id', 'invalid-email');
    await page.click('button[type="submit"]');
    await randomDelay();
    
    // Test valid data
    await page.fill('#my-text-id', ''); // Clear
    await humanType(page, '#my-text-id', 'valid@email.com');
    await page.click('button[type="submit"]');
    
    // Save validation test results
    const validationResults = {
      emptyFormValidation: requiredFields,
      testedAt: new Date().toISOString()
    };
    
    await saveToJSON(validationResults, 'form-validation-test');
    
    console.log('✅ Form validation testing completed');
  });
});
