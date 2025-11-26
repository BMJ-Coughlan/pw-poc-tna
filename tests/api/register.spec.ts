import { test, expect } from '../../lib/fixtures/testBase';
import { UserBuilder } from '../../lib/helpers/testDataBuilders';
import { expectApiError, expectToThrow } from '../../lib/helpers/apiAssertions';

/**
 * User registration endpoint tests.
 *
 * Covers happy path registration, validation errors, duplicate emails,
 * and malformed payloads. Validates proper HTTP status codes and error
 * response structures.
 */

test.describe('User Registration', () => {
  test('should successfully register a new user', async ({ authAPI }) => {
    const user = UserBuilder.valid({ name: 'New User', password: 'securepassword123' });

    const response = await authAPI.register(user);
    expect(response).toBeDefined();
  });

  test('should reject registration with missing name', async ({ authAPI }) => {
    const invalidUser = UserBuilder.withInvalid('name');
    await expectToThrow(() => authAPI.register(invalidUser as any));
  });

  test('should reject registration with invalid email format', async ({ authAPI }) => {
    const invalidUser = UserBuilder.withInvalid('email');
    await expectToThrow(() => authAPI.register(invalidUser as any));
  });

  test('should reject registration with short password', async ({ authAPI }) => {
    const invalidUser = UserBuilder.withInvalid('password');
    await expectToThrow(() => authAPI.register(invalidUser as any));
  });

  test('should reject registration with missing required fields', async ({ authAPI }) => {
    const invalidUser = UserBuilder.withMissingFields(['email', 'password']);
    await expectToThrow(() => authAPI.register(invalidUser as any));
  });

  test('should return proper error status and message for duplicate email', async ({ authAPI }) => {
    const user = UserBuilder.valid();
    await authAPI.register(user);

    try {
      await authAPI.register(user);
      throw new Error('Expected registration to fail for duplicate email');
    } catch (error) {
      expectApiError(error);
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
    const user = UserBuilder.valid();
    const response = await page.request.post('/notes/api/users/register', {
      data: {
        ...user,
        unexpectedField: 'should be ignored or rejected',
        anotherBadField: 12345,
      },
    });

    const status = response.status();
    expect(status === 201 || status === 400 || status === 422).toBe(true);
  });
});
