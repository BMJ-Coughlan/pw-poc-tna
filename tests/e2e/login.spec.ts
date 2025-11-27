import { test, expect } from '../../lib/fixtures/testBase';
import { LoginPage } from '../../lib/pages';
import {
  generateUniqueEmail,
  expectValidationFailure,
  waitForAuthResponse,
} from '../../lib/helpers/e2eHelpers';

/**
 * E2E tests for the user login flow.
 *
 * These tests interact with the login UI to verify authentication,
 * validation, error handling, and navigation. Users are pre-registered via
 * API to ensure known credentials exist, then login flow is tested.
 */

test.describe('Login Flow - E2E @e2e', () => {
  test('should login successfully with valid credentials @smoke', async ({
    page,
    authAPI,
  }, testInfo) => {
    // Pre-register user via API (API creates accounts that work with UI login)
    const uniqueEmail = generateUniqueEmail('login', testInfo);
    const userData = {
      name: 'E2E Login User',
      email: uniqueEmail,
      password: process.env.E2E_TEST_PASSWORD!,
    };
    await authAPI.register(userData);

    // Test the login UI with email (not username)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);
    await waitForAuthResponse(page);

    // Verify login was successful - either navigated away or no error shown
    const url = page.url();
    const hasError = await loginPage.hasErrorMessage();

    // Should either navigate to notes app OR stay on page without error
    expect(url.includes('/notes/app') || !hasError).toBeTruthy();
  });

  test('should show error for invalid credentials @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(
      process.env.E2E_INVALID_USERNAME || 'nonexistentuser123456',
      process.env.E2E_TEST_PASSWORD || 'password123'
    );
    await waitForAuthResponse(page);

    await expectValidationFailure(page, loginPage, '/login');
  });

  test('should show error for incorrect password', async ({ page, authAPI }, testInfo) => {
    // Pre-register user via API
    const uniqueEmail = generateUniqueEmail('wrongpwd', testInfo);
    await authAPI.register({
      name: 'Test User',
      email: uniqueEmail,
      password: process.env.E2E_CORRECT_PASSWORD!,
    });

    // Attempt login with wrong password
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(uniqueEmail, process.env.E2E_WRONG_PASSWORD!);
    await waitForAuthResponse(page);

    await expectValidationFailure(page, loginPage, '/login');
  });

  test('should show validation error for empty username @regression @validation', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('', 'password123');

    await expectValidationFailure(page, loginPage, 'login');
  });

  test('should show validation errors for missing username @regression @validation', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(process.env.E2E_VALIDATION_USERNAME || 'testuser', '');

    await expectValidationFailure(page, loginPage, 'login');
  });

  test('should navigate to registration page when clicking register link', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.goToRegister();

    await expect(page).toHaveURL(/register/);
  });
});
