/**
 * Zod schemas for user login requests and responses.
 *
 * Includes schemas for successful authentication as well as error scenarios
 * like invalid credentials or malformed requests.
 */
import { z } from 'zod';

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
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  password: z.string().min(1),
});

/**
 * Schema for a successful login response.
 *
 * The remote API sometimes returns a token at the top-level (`token`) or nested
 * inside `data.token`. This schema accepts either shape and enforces that at
 * least one of those is present. Additional properties are preserved via
 * `.catchall()` to avoid strict rejections when the API returns envelope
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
  .catchall(z.any());

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
