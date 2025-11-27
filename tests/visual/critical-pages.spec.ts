import { test, expect } from '../../lib/fixtures/testBase';
import { LoginPage, RegistrationPage } from '../../lib/pages';

/**
 * Visual regression tests for critical application pages.
 *
 * These tests capture screenshots of key pages and compare them against
 * baseline images to detect unintended visual changes. Playwright automatically
 * handles cross-browser screenshot normalization and provides diff images
 * when visual changes are detected.
 *
 * Test tags:
 * - @visual: all visual regression tests
 * - @critical: tests for business-critical pages
 */

test.describe('Critical Pages - Visual Regression @visual @critical', () => {
  test('login page should match baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Wait for page to be fully loaded and stable
    await page.waitForLoadState('networkidle');

    // Hide dynamic content that changes between runs
    await page.addStyleTag({
      content: `
        /* Hide elements with dynamic timestamps or session data */
        [data-testid="timestamp"],
        .session-id,
        .build-version {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('registration page should match baseline', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    // Wait for the form to be visible instead of networkidle (page may have continuous network activity)
    await page.locator('input[name="username"]').waitFor({ state: 'visible' });

    await expect(page).toHaveScreenshot('registration-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('authenticated dashboard should match baseline', async ({ authenticatedPage }) => {
    // authenticatedPage fixture provides already-authenticated page
    await authenticatedPage.waitForLoadState('networkidle');

    // Hide user-specific dynamic content
    await authenticatedPage.addStyleTag({
      content: `
        /* Hide user-specific elements */
        .user-email,
        .last-login,
        [data-testid="user-id"] {
          visibility: hidden !important;
        }
      `,
    });

    await expect(authenticatedPage).toHaveScreenshot('dashboard-authenticated.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('login page - empty state', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await page.waitForLoadState('networkidle');

    // Capture just the form area (component-level screenshot)
    const formElement = page.locator('form, .login-form, [data-testid="login-form"]').first();
    await expect(formElement).toHaveScreenshot('login-form-empty.png', {
      animations: 'disabled',
    });
  });

  test('login page - validation error state', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Trigger validation error by submitting empty form
    await loginPage.login('', '');

    // Wait for error to appear
    await page.waitForTimeout(500);

    // Capture error state
    await expect(page).toHaveScreenshot('login-page-error.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('registration page - password mismatch error', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    // Trigger validation error
    await registrationPage.register('testuser', 'password123', 'different456');

    // Wait for error to appear
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('registration-page-password-mismatch.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('mobile viewport - login page', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-page-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('tablet viewport - dashboard', async ({ authenticatedPage }) => {
    // Set tablet viewport
    await authenticatedPage.setViewportSize({ width: 768, height: 1024 }); // iPad

    await authenticatedPage.waitForLoadState('networkidle');

    await authenticatedPage.addStyleTag({
      content: `
        .user-email,
        .last-login,
        [data-testid="user-id"] {
          visibility: hidden !important;
        }
      `,
    });

    await expect(authenticatedPage).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
