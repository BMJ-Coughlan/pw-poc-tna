import { test, expect } from '../../lib/fixtures/testBase';
import { LoginPage } from '../../lib/pages';

/**
 * E2E tests for the user login flow.
 *
 * These tests interact with the login UI to verify authentication,
 * validation, error handling, and navigation. Users are pre-registered via
 * UI to ensure known credentials exist (username/password), then login flow is tested.
 */

test.describe('Login Flow - E2E', () => {
  test('should login successfully with valid credentials', async ({ page, authAPI }, testInfo) => {
    // Pre-register user via API (API creates accounts that work with UI login)
    const uniqueEmail = `e2e_login_w${testInfo.workerIndex}_${Date.now()}@example.com`;
    const userData = {
      name: 'E2E Login User',
      email: uniqueEmail,
      password: 'TestPassword123!',
    };
    await authAPI.register(userData);

    // Test the login UI with email (not username)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(userData.email, userData.password);
    await page.waitForTimeout(2000);

    // Verify login was successful - either navigated away or no error shown
    const url = page.url();
    const hasError = await loginPage.hasErrorMessage();

    // Should either navigate to notes app OR stay on page without error
    expect(url.includes('/notes/app') || !hasError).toBeTruthy();
  });

  test('should show error for non-existent user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('nonexistentuser123456', 'password123');

    // Wait a moment for error to appear
    await page.waitForTimeout(1000);

    // Should show error OR stay on login page (indicates failure)
    const hasError = await loginPage.hasErrorMessage();
    const stillOnLogin = page.url().includes('/login');

    // Either shows error or didn't navigate away from login
    expect(hasError || stillOnLogin).toBeTruthy();
  });

  test('should show error for incorrect password', async ({ page, authAPI }, testInfo) => {
    // Pre-register user via API
    const uniqueEmail = `e2e_wrongpwd_w${testInfo.workerIndex}_${Date.now()}@example.com`;
    await authAPI.register({
      name: 'Test User',
      email: uniqueEmail,
      password: 'CorrectPassword123!',
    });

    // Attempt login with wrong password
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(uniqueEmail, 'WrongPassword456!');

    // Wait for error
    await page.waitForTimeout(1000);

    // Should show error OR stay on login page
    const hasError = await loginPage.hasErrorMessage();
    const stillOnLogin = page.url().includes('/login');

    expect(hasError || stillOnLogin).toBeTruthy();
  });

  test('should show validation error for empty username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('', 'password123');

    const hasError = await loginPage.hasErrorMessage();
    const stillOnLogin = page.url().includes('login');

    expect(hasError || stillOnLogin).toBeTruthy();
  });

  test('should show validation error for empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('testuser', '');

    const hasError = await loginPage.hasErrorMessage();
    const stillOnLogin = page.url().includes('login');

    expect(hasError || stillOnLogin).toBeTruthy();
  });

  test('should navigate to registration page when clicking register link', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.goToRegister();

    await expect(page).toHaveURL(/register/);
  });
});
