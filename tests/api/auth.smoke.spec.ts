import { test, expect } from '../../lib/fixtures/testBase';

/**
 * Authentication smoke tests.
 *
 * High-level integration tests that verify the complete authentication flow
 * works end-to-end, including API calls and UI navigation. These tests use
 * fixtures to demonstrate hybrid testing patterns where the API provisions
 * test state and the UI validates the result.
 */

test.describe('Authentication Smoke Tests', () => {
  test('should complete full registration and login flow with UI navigation', async ({
    userProfile,
    authenticatedPage,
  }) => {
    expect(userProfile.token).toBeTruthy();

    await authenticatedPage.waitForLoadState('domcontentloaded');
    const url = authenticatedPage.url();
    expect(url).toContain('/notes/app');
  });
});
