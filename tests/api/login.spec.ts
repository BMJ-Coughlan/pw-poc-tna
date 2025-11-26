import { test, expect } from '../../lib/fixtures/testBase';
import { ApiError } from '../../lib/apis/baseApi';

/**
 * User login endpoint tests.
 *
 * Covers successful authentication, invalid credentials, validation errors,
 * and malformed requests. Validates proper HTTP status codes and error
 * response structures for authentication failures.
 */

test.describe('User Login', () => {
  test('should successfully login with valid credentials', async ({ authAPI }) => {
    const email = `validuser-${Date.now()}@example.com`;
    const password = 'validpassword123';

    await authAPI.register({
      name: 'Valid User',
      email,
      password,
    });

    const token = await authAPI.login(email, password);
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  test('should reject login with invalid email format', async ({ authAPI }) => {
    await expect(async () => {
      await authAPI.login('not-an-email', 'password123');
    }).rejects.toThrow();
  });

  test('should reject login with empty password', async ({ authAPI }) => {
    await expect(async () => {
      await authAPI.login('test@example.com', '');
    }).rejects.toThrow();
  });

  test('should return 401 for non-existent user', async ({ authAPI }) => {
    const email = `nonexistent-${Date.now()}@example.com`;

    try {
      await authAPI.login(email, 'wrongpassword');
      throw new Error('Expected login to fail for non-existent user');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.status).toBe(401);
      expect(apiError.body).toBeDefined();
    }
  });

  test('should return 401 for incorrect password', async ({ authAPI }) => {
    const email = `valid-${Date.now()}@example.com`;
    await authAPI.register({
      name: 'Test User',
      email,
      password: 'correctpassword123',
    });

    try {
      await authAPI.login(email, 'wrongpassword123');
      throw new Error('Expected login to fail with incorrect password');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.status).toBe(401);
      expect(apiError.body).toBeDefined();

      if (typeof apiError.body === 'object' && apiError.body !== null) {
        const errorMessage = (apiError.body as any).message || (apiError.body as any).error;
        expect(errorMessage).toBeTruthy();
      }
    }
  });

  test('should validate error response structure for auth failure', async ({ authAPI }) => {
    const email = `test-${Date.now()}@example.com`;

    try {
      await authAPI.login(email, 'wrongpassword');
      throw new Error('Expected login to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;

      expect(apiError.status).toBeDefined();
      expect(apiError.status).toBeGreaterThanOrEqual(400);
      expect(apiError.body).toBeDefined();

      if (typeof apiError.body === 'object' && apiError.body !== null) {
        const body = apiError.body as any;
        expect(body.message || body.error).toBeTruthy();
      }
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
