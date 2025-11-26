import { test, expect } from '../../lib/fixtures/testBase';

/**
 * Minimal API+UI smoke test.
 *
 * This test demonstrates the hybrid flow where the API provisions a user
 * and the browser page is pre-authenticated via cookie injection. It asserts
 * that a token was obtained and the browser navigated to the app URL.
 */
test('API + UI smoke: register, login and open app', async ({ userProfile, authenticatedPage }) => {
  // Ensure the fixture provided a token
  expect(userProfile.token).toBeTruthy();

  // Ensure the page was navigated to the app
  await authenticatedPage.waitForLoadState('domcontentloaded');
  const url = authenticatedPage.url();
  expect(url).toContain('/notes/app');
});
