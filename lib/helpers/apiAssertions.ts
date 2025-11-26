/**
 * Reusable assertion helpers for API testing.
 *
 * Encapsulates common assertion patterns for API errors and responses,
 * reducing duplication and improving test readability.
 */

import { expect } from '@playwright/test';
import { ApiError } from '../apis/baseApi';

/**
 * Asserts that an error is an ApiError with expected properties.
 *
 * @param error - The caught error
 * @param expectedStatus - Optional specific HTTP status code to assert
 * @returns The typed ApiError for further assertions
 */
export function expectApiError(error: unknown, expectedStatus?: number): ApiError {
  expect(error).toBeInstanceOf(ApiError);
  const apiError = error as ApiError;

  if (expectedStatus !== undefined) {
    expect(apiError.status).toBe(expectedStatus);
  } else {
    expect(apiError.status).toBeGreaterThanOrEqual(400);
  }

  expect(apiError.body).toBeDefined();
  return apiError;
}

/**
 * Asserts that an API error has a proper error message structure.
 *
 * @param error - The ApiError to validate
 */
export function expectErrorMessage(error: ApiError): void {
  if (typeof error.body === 'object' && error.body !== null) {
    const body = error.body as any;
    expect(body.message || body.error).toBeTruthy();
  }
}

/**
 * Asserts that an async operation throws an error.
 * Useful for validation error tests.
 *
 * @param operation - The async operation expected to fail
 */
export async function expectToThrow(operation: () => Promise<any>): Promise<void> {
  await expect(operation).rejects.toThrow();
}
