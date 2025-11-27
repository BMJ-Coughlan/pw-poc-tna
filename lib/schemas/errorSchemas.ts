/**
 * Zod schemas for API error responses.
 *
 * Defines standard error shapes returned by the API when validation fails,
 * authentication errors occur, or other bad request scenarios happen.
 */
import { z } from 'zod';

/**
 * Schema for validation error details.
 *
 * Used when the API returns field-specific validation errors (e.g., 400 or 422).
 */
export const ValidationErrorSchema = z.object({
  field: z.string().optional(),
  message: z.string(),
  code: z.string().optional(),
});

/**
 * Schema for generic API error responses.
 *
 * Properties:
 * - `message`: error message describing what went wrong
 * - `error`: optional error type/code
 * - `errors`: optional array of validation errors for specific fields
 * - `status`: HTTP status code
 *
 * The schema uses `.passthrough()` to tolerate additional envelope metadata.
 */
export const ApiErrorResponseSchema = z
  .object({
    message: z.string(),
    error: z.string().optional(),
    errors: z.array(ValidationErrorSchema).optional(),
    status: z.number().optional(),
    data: z.any().optional(),
  })
  .passthrough();

/**
 * Schema for 400 Bad Request responses.
 *
 * Typically returned when request payload is malformed or missing required fields.
 */
export const BadRequestErrorSchema = ApiErrorResponseSchema.extend({
  status: z.literal(400).optional(),
});

/**
 * Schema for 401 Unauthorized responses.
 *
 * Returned when authentication fails (invalid credentials, missing token, etc.).
 */
export const UnauthorizedErrorSchema = ApiErrorResponseSchema.extend({
  status: z.literal(401).optional(),
  message: z.string(),
});

/**
 * Schema for 422 Unprocessable Entity responses.
 *
 * Returned when request is well-formed but fails business validation rules.
 */
export const UnprocessableEntityErrorSchema = ApiErrorResponseSchema.extend({
  status: z.literal(422).optional(),
  errors: z.array(ValidationErrorSchema).optional(),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type BadRequestError = z.infer<typeof BadRequestErrorSchema>;
export type UnauthorizedError = z.infer<typeof UnauthorizedErrorSchema>;
export type UnprocessableEntityError = z.infer<typeof UnprocessableEntityErrorSchema>;
