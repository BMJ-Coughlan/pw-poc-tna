import { test, expect } from '../../lib/fixtures/testBase';
import { LoginPage, RegistrationPage } from '../../lib/pages';

/**
 * E2E tests for session management and navigation.
 *
 * Validates basic navigation and access controls for the authentication system.
 * Note: Full session tests (logout, persistence) are limited by the test site's
 * UI-only registration which doesn't integrate with the API-based notes app.
 */

test.describe('Session and Navigation - E2E', () => {
  test('should allow navigation to login from unauthenticated state', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify we can access login page
    await expect(page).toHaveURL(/login/);
    expect(await loginPage.loginButton.isVisible()).toBeTruthy();
  });

  test('should allow navigation to registration from unauthenticated state', async ({ page }) => {
    const regPage = new RegistrationPage(page);
    await regPage.goto();

    // Verify we can access registration page
    await expect(page).toHaveURL(/register/);
    expect(await regPage.registerButton.isVisible()).toBeTruthy();
  });

  test('should navigate from login to registration page', async ({ page }) => {
    // Start at login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page).toHaveURL(/login/);

    // Go to registration
    await loginPage.goToRegister();
    await expect(page).toHaveURL(/register/);
  });
});
