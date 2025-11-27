/**
 * Test data builders for user-related test scenarios.
 *
 * Provides factory methods to generate valid and invalid user payloads,
 * reducing duplication across test files and ensuring consistent test data.
 */

export interface UserData {
  name: string;
  email: string;
  password: string;
}

/**
 * Builder for creating user test data with common patterns.
 */
export class UserBuilder {
  /**
   * Creates a unique valid user with a timestamped email.
   */
  static valid(overrides: Partial<UserData> = {}): UserData {
    return {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      ...overrides,
    };
  }

  /**
   * Creates a user with a specific field made invalid for validation testing.
   */
  static withInvalid(field: 'name' | 'email' | 'password'): UserData {
    const base = this.valid();

    if (field === 'name') return { ...base, name: '' };
    if (field === 'email') return { ...base, email: 'not-an-email' };
    if (field === 'password') return { ...base, password: '12345' };

    return base;
  }

  /**
   * Creates a user with missing required fields for validation testing.
   */
  static withMissingFields(fields: Array<'email' | 'password'>): Partial<UserData> {
    const base = this.valid();
    const result: any = { ...base };

    fields.forEach((field) => {
      delete result[field];
    });

    return result;
  }
}
