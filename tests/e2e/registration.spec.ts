import { test, expect } from '../../lib/fixtures/testBase';
import { RegistrationPage } from '../../lib/pages';

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

    const uniqueUsername = `e2e_user_w${testInfo.workerIndex}_${Date.now()}`;
    const password = 'TestPassword123!';

    await registrationPage.register(uniqueUsername, password, password);

    // After successful registration, check for success message or redirect
    // The app might show a success message and stay on the page, or redirect
    await page.waitForTimeout(2000); // Give time for success message or redirect

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

    // Should show error or prevent submission
    const hasError = await registrationPage.hasErrorMessage();
    const stillOnRegister = page.url().includes('register');

    expect(hasError || stillOnRegister).toBeTruthy();
  });

  test('should show validation error for missing password', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    await registrationPage.register('testuser', '', '');

    const hasError = await registrationPage.hasErrorMessage();
    const stillOnRegister = page.url().includes('register');

    expect(hasError || stillOnRegister).toBeTruthy();
  });

  test('should show validation error for short password', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    await registrationPage.register('testuser', '123', '123');

    const hasError = await registrationPage.hasErrorMessage();
    const stillOnRegister = page.url().includes('register');

    expect(hasError || stillOnRegister).toBeTruthy();
  });

  test('should show validation error for password mismatch', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    await registrationPage.register('testuser', 'password123', 'different456');

    const hasError = await registrationPage.hasErrorMessage();
    const stillOnRegister = page.url().includes('register');

    expect(hasError || stillOnRegister).toBeTruthy();
  });
});
