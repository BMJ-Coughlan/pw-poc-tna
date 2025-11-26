import { test, expect } from '../../lib/fixtures/testBase';
import { ApiError } from '../../lib/apis/baseApi';

/**
 * User registration endpoint tests.
 *
 * Covers happy path registration, validation errors, duplicate emails,
 * and malformed payloads. Validates proper HTTP status codes and error
 * response structures.
 */

test.describe('User Registration', () => {
  test('should successfully register a new user', async ({ authAPI }) => {
    const user = {
      name: 'New User',
      email: `newuser-${Date.now()}@example.com`,
      password: 'securepassword123',
    };

    const response = await authAPI.register(user);
    expect(response).toBeDefined();
  });

  test('should reject registration with missing name', async ({ authAPI }) => {
    const invalidUser = {
      name: '',
      email: 'test@example.com',
      password: 'password123',
    };

    await expect(async () => {
      await authAPI.register(invalidUser as any);
    }).rejects.toThrow();
  });

  test('should reject registration with invalid email format', async ({ authAPI }) => {
    const invalidUser = {
      name: 'Test User',
      email: 'not-an-email',
      password: 'password123',
    };

    await expect(async () => {
      await authAPI.register(invalidUser as any);
    }).rejects.toThrow();
  });

  test('should reject registration with short password', async ({ authAPI }) => {
    const invalidUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: '12345',
    };

    await expect(async () => {
      await authAPI.register(invalidUser as any);
    }).rejects.toThrow();
  });

  test('should reject registration with missing required fields', async ({ authAPI }) => {
    const invalidUser = {
      name: 'Test User',
    };

    await expect(async () => {
      await authAPI.register(invalidUser as any);
    }).rejects.toThrow();
  });

  test('should return proper error status and message for duplicate email', async ({ authAPI }) => {
    const email = `duplicate-${Date.now()}@example.com`;
    const user = {
      name: 'Test User',
      email,
      password: 'password123',
    };

    await authAPI.register(user);

    try {
      await authAPI.register(user);
      throw new Error('Expected registration to fail for duplicate email');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.status).toBeGreaterThanOrEqual(400);
      expect(apiError.body).toBeDefined();
    }
  });

  test('should handle malformed registration payload gracefully', async ({ page }) => {
    const response = await page.request.post('/notes/api/users/register', {
      data: {
        name: 123,
        email: true,
        password: null,
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('should handle registration with extra unexpected fields', async ({ page }) => {
    const response = await page.request.post('/notes/api/users/register', {
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        unexpectedField: 'should be ignored or rejected',
        anotherBadField: 12345,
      },
    });

    const status = response.status();
    expect(status === 201 || status === 400 || status === 422).toBe(true);
  });
});
