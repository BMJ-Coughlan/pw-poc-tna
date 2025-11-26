import { test as base, Page } from '@playwright/test';
import { UsersApi } from '../apis/usersApi';

/**
 * Lightweight representation of a test user created for each test.
 *
 * - `name`: display name used when provisioning the user
 * - `email`: unique email address used to register/login
 * - `password`: plaintext password used for login (test-only)
 * - `token`: authentication token returned from the API after login
 */
type UserProfile = { name: string; email: string; password: string; token: string };

/**
 * Custom fixtures provided to tests.
 *
 * - `authAPI`: API client for user operations (register/login)
 * - `authenticatedPage`: Playwright `Page` already authenticated to the app
 * - `userProfile`: a unique user profile created and logged-in for the test
 */
type MyFixtures = {
  authAPI: UsersApi;
  authenticatedPage: Page; // The ready-to-use page
  userProfile: UserProfile;
};

export const test = base.extend<MyFixtures>({
  /**
   * Fixture exposing a `UsersApi` client backed by Playwright's
   * `APIRequestContext`. Tests should prefer using this over raw HTTP calls.
   */
  authAPI: async ({ request }, use) => {
    await use(new UsersApi(request));
  },

  /**
   * Creates a unique user for each test and returns a `UserProfile` with
   * an authentication token. This fixture performs two fast API calls:
   * 1) `authAPI.register` to provision the user
   * 2) `authAPI.login` to obtain the token
   */
  userProfile: async ({ authAPI }, use) => {
    const uniqueId = Date.now();
    const user = {
      name: `Test User ${uniqueId}`,
      email: `test_user_${uniqueId}@example.com`,
      password: 'password123', // constant password for simplicity
      token: '',
    };

    // 1. Provision the user via API (Fast)
    await authAPI.register(user);

    // 2. Login via API to get the Token
    user.token = await authAPI.login(user.email, user.password);

    await use(user);
  },

  /**
   * Authenticated browser `Page` fixture.
   *
   * This fixture injects the API-obtained token into the page context as a
   * cookie and navigates directly to the app, bypassing the login UI. Use
   * this when a test needs to interact with the UI as an authenticated user.
   */
  authenticatedPage: async (
    { page, userProfile }: { page: Page; userProfile: UserProfile },
    use: (value: Page) => Promise<void>
  ) => {
    // 3. Inject the Token into the Browser
    // The Notes App expects the token in a cookie named "token" for UI access
    await page.context().addCookies([
      {
        name: 'token',
        value: userProfile.token,
        domain: 'practice.expandtesting.com',
        path: '/',
      },
    ]);

    // 4. Navigate directly to the app (bypassing login UI)
    await page.goto('/notes/app');

    // 5. Verify we are in (sanity check)
    // If the 'Logout' button is visible, the injection worked
    await use(page);
  },
});

export { expect } from '@playwright/test';
