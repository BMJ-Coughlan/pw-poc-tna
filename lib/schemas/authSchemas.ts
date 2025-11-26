/**
 * Centralized Zod schemata for authentication-related request and response
 * shapes used across the API client. Place additional resource schemata in
 * this directory and export them for reuse in `lib/apis/*`.
 *
 * These schemata are designed for runtime validation of outbound requests
 * and inbound responses. Many server responses use an envelope shape
 * (for example `{ data: { ... } }`); the schemas below often `passthrough()`
 * or extract `data` so they're tolerant of envelope metadata.
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
 * Zod schema for a registration response payload.
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
 *
 * @constant
 * @type {import("zod").ZodTypeAny}
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
 * Schema for a login request.
 *
 * Properties:
 * - `email`: valid email address used to identify the user
 * - `password`: non-empty string containing the user's password
 *
 * Use this schema to validate login payloads before sending them to the API.
 */
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Schema for the login response.
 *
 * The remote API sometimes returns a token at the top-level (`token`) or nested
 * inside `data.token`. This schema accepts either shape and enforces that at
 * least one of those is present. Additional properties are preserved via
 * `.passthrough()` to avoid strict rejections when the API returns envelope
 * metadata.
 *
 * Example valid shapes:
 * - `{ data: { token: '...' } }`
 * - `{ token: '...' }`
 */
export const LoginResponseSchema = z
  .object({
    data: z.object({ token: z.string() }).optional(),
    token: z.string().optional(),
  })
  .refine((val) => Boolean(val?.data?.token || val?.token), {
    message: 'Expected response to include a token in `data.token` or `token`',
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

/**
 * Request payload accepted by `UsersApi.login`.
 */
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Response shape returned by the login endpoint.
 *
 * Use this type when extracting the token from the response; prefer
 * checking `data?.token` and falling back to `token` for compatibility.
 */
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
