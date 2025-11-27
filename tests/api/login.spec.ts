import { test, expect } from '../../lib/fixtures/testBase';
import { UserBuilder } from '../../lib/helpers/testDataBuilders';
import { expectApiError, expectErrorMessage, expectToThrow } from '../../lib/helpers/apiAssertions';

/**
 * User login endpoint tests.
 *
 * Covers successful authentication, invalid credentials, validation errors,
 * and malformed requests. Validates proper HTTP status codes and error
 * response structures for authentication failures.
 */

test.describe('User Login', () => {
  test('should successfully login with valid credentials', async ({ authAPI }) => {
    const user = UserBuilder.valid({ password: 'validpassword123' });
    await authAPI.register(user);

    const token = await authAPI.login(user.email, user.password);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  test('should reject login with invalid email format', async ({ authAPI }) => {
    await expectToThrow(() => authAPI.login('not-an-email', 'password123'));
  });

  test('should reject login with empty password', async ({ authAPI }) => {
    await expectToThrow(() => authAPI.login('test@example.com', ''));
  });

  test('should return 401 for non-existent user', async ({ authAPI }) => {
    const user = UserBuilder.valid();

    try {
      await authAPI.login(user.email, 'wrongpassword');
      throw new Error('Expected login to fail for non-existent user');
    } catch (error) {
      expectApiError(error, 401);
    }
  });

  test('should return 401 for incorrect password', async ({ authAPI }) => {
    const user = UserBuilder.valid({ password: 'correctpassword123' });
    await authAPI.register(user);

    try {
      await authAPI.login(user.email, 'wrongpassword123');
      throw new Error('Expected login to fail with incorrect password');
    } catch (error) {
      const apiError = expectApiError(error, 401);
      expectErrorMessage(apiError);
    }
  });

  test('should validate error response structure for auth failure', async ({ authAPI }) => {
    const user = UserBuilder.valid();

    try {
      await authAPI.login(user.email, 'wrongpassword');
      throw new Error('Expected login to fail');
    } catch (error) {
      const apiError = expectApiError(error);
      expectErrorMessage(apiError);
    }
  });

  test('should handle malformed login payload gracefully', async ({ page }) => {
    const response = await page.request.post('/notes/api/users/login', {
      data: {
        email: 12345,
        password: {},
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    const body = await response.json();
    expect(body).toBeDefined();
  });
});
