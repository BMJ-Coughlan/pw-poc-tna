import { test, expect } from '../../lib/fixtures/testBase';
import { RegistrationPage } from '../../lib/pages';
import {
  generateUniqueUsername,
  expectValidationFailure,
  waitForRegistrationComplete,
} from '../../lib/helpers/e2eHelpers';

/**
 * E2E tests for the user registration flow.
 *
 * These tests interact with the registration UI to verify the complete
 * user experience, including form validation, error handling, and navigation.
 * User data is generated with workerId and timestamp to ensure parallel safety.
 */

test.describe('Registration Flow - E2E', () => {
  test('should register a new user successfully and navigate to login or app', async ({
    page,
  }, testInfo) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    const uniqueUsername = generateUniqueUsername(testInfo);
    const password = process.env.E2E_TEST_PASSWORD!;
    await registrationPage.register(uniqueUsername, password, password);

    // After successful registration, check for success message or redirect
    await waitForRegistrationComplete(page);

    const url = page.url();
    const hasSuccessMessage = await page
      .locator('[role="alert"], .alert-success, .success')
      .isVisible()
      .catch(() => false);

    // Either redirected OR showing success message on same page
    expect(url.includes('/notes/app') || url.includes('/login') || hasSuccessMessage).toBeTruthy();
  });

  test('should show validation error for missing username', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    await registrationPage.register('', 'password123', 'password123');

    await expectValidationFailure(page, registrationPage, 'register');
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    await registrationPage.register(process.env.E2E_VALIDATION_USERNAME || 'testuser', '', '');

    await expectValidationFailure(page, registrationPage, 'register');
  });

  test('should show validation errors for short password', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    await registrationPage.register(
      process.env.E2E_VALIDATION_USERNAME || 'testuser',
      '123',
      '123'
    );

    await expectValidationFailure(page, registrationPage, 'register');
  });

  test('should show validation errors for mismatched passwords', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    await registrationPage.register(
      process.env.E2E_VALIDATION_USERNAME || 'testuser',
      'password123',
      'different456'
    );

    await expectValidationFailure(page, registrationPage, 'register');
  });
});
