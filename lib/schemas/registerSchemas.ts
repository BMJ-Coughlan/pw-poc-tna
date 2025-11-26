/**
 * Zod schemas for user registration requests and responses.
 *
 * Includes schemas for happy path registration as well as validation errors
 * and other failure scenarios.
 */
import { z } from 'zod';

/**
 * Schema for a request to register a new user.
 *
 * Properties:
 * - `name`: non-empty string
 * - `email`: valid email address
 * - `password`: string with at least 6 characters
 *
 * Use this schema to validate request payloads sent to the users/register endpoint.
 */
export const RegisterUserRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * Zod schema for a successful registration response payload.
 *
 * Validates an object that may include:
 * - data (optional): a nested object with optional fields:
 *   - id: string | number
 *   - name: string
 *   - email: string (must be a valid email)
 * - id (optional): string | number (top-level)
 * - name (optional): string (top-level)
 * - email (optional): string (top-level, must be a valid email)
 *
 * The schema is created with .passthrough(), so additional unknown properties are allowed and preserved.
 */
export const RegisterResponseSchema = z
  .object({
    data: z
      .object({
        id: z.union([z.string(), z.number()]).optional(),
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
      .optional(),
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
  })
  .passthrough();

/**
 * Request payload accepted by `UsersApi.register`.
 */
export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;

/**
 * Response shape returned by the registration endpoint.
 *
 * This type mirrors `RegisterResponseSchema` and may include additional
 * properties when the remote API returns envelope metadata.
 */
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
