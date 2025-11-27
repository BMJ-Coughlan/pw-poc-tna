import { Page, expect as playwrightExpect, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { RegistrationPage } from '../pages/registrationPage';

/**
 * E2E test helpers to reduce duplication in UI tests.
 *
 * These helpers encapsulate common patterns like error checking,
 * test data generation, and page setup to keep tests clean and DRY.
 */

/**
 * Generate a unique email for E2E tests using worker index and timestamp.
 *
 * @param prefix - prefix for the email (e.g., 'login', 'register')
 * @param testInfo - Playwright test info for worker index
 * @returns unique email address
 */
export function generateUniqueEmail(prefix: string, testInfo: TestInfo): string {
  return `e2e_${prefix}_w${testInfo.workerIndex}_${Date.now()}@example.com`;
}

/**
 * Generate a unique username for E2E tests using worker index and timestamp.
 *
 * @param testInfo - Playwright test info for worker index
 * @returns unique username
 */
export function generateUniqueUsername(testInfo: TestInfo): string {
  return `e2e_user_w${testInfo.workerIndex}_${Date.now()}`;
}

/**
 * Assert that an error is displayed OR the page hasn't navigated away.
 * This is the common pattern for validation error tests.
 *
 * @param page - Playwright page
 * @param pageObject - Page object with hasErrorMessage() method
 * @param expectedUrl - URL fragment that should be present if navigation failed
 */
export async function expectValidationFailure(
  page: Page,
  pageObject: LoginPage | RegistrationPage,
  expectedUrl: string
): Promise<void> {
  const hasError = await pageObject.hasErrorMessage();
  const stillOnPage = page.url().includes(expectedUrl);
  playwrightExpect(hasError || stillOnPage).toBeTruthy();
}

/**
 * Wait for login/registration to complete (success or error).
 * Standard timeout used across E2E tests.
 */
export async function waitForAuthResponse(page: Page): Promise<void> {
  await page.waitForTimeout(1000);
}

/**
 * Wait for page transition after successful registration.
 * Longer timeout since registration may show success message or redirect.
 */
export async function waitForRegistrationComplete(page: Page): Promise<void> {
  await page.waitForTimeout(2000);
}
