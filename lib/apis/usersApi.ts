import { APIRequestContext } from '@playwright/test';
import { BaseApi, ApiError } from './baseApi';
import {
    RegisterUserRequestSchema,
    RegisterResponseSchema,
    LoginRequestSchema,
    LoginResponseSchema,
} from '../data/schemata/authSchemas';

/**
 * UsersApi — resource client for Users-related endpoints.
 *
 * This class is a thin wrapper around `BaseApi` that provides typed helpers
 * for user registration and authentication. The constructor accepts either a
 * Playwright `APIRequestContext` or an existing `BaseApi` instance.
 */
export class UsersApi {
    readonly base: BaseApi;

    /**
     * Create a UsersApi instance.
     * @param requestOrBase - an `APIRequestContext` or pre-configured `BaseApi`
     */
    constructor(requestOrBase: APIRequestContext | BaseApi) {
        if (requestOrBase instanceof BaseApi) {
            this.base = requestOrBase;
        } else {
            this.base = new BaseApi(requestOrBase);
        }
    }

    /**
     * Register a new user.
     *
     * Validates the request using `RegisterUserRequestSchema`, posts to the
     * registration endpoint, and returns the unwrapped response payload.
     *
     * @param user - object containing `name`, `email`, and `password`
     * @returns the registration response payload (may include `id`, `email`, etc.)
     * @throws {ApiError} when the request fails or validation fails
     */
    async register(user: { name: string; email: string; password: string }): Promise<any> {
        RegisterUserRequestSchema.parse(user);

        try {
            // BaseApi.post will validate envelope and return the `data` payload
            const data = await this.base.post<any>('/notes/api/users/register', { data: user }, RegisterResponseSchema);
            return data ?? {};
        } catch (err) {
            if (err instanceof ApiError) throw err;
            throw new ApiError(String(err));
        }
    }

    /**
     * Log in and return an authentication token.
     *
     * Validates the login request, posts credentials to the login endpoint,
     * and returns the token extracted from the response (supports both
     * `data.token` and top-level `token`).
     *
     * @param email - user email
     * @param password - user password
     * @returns authentication token string
     * @throws {ApiError} when the request fails or validation fails
     */
    async login(email: string, password: string): Promise<string> {
        LoginRequestSchema.parse({ email, password });

        try {
            const data = await this.base.post<any>('/notes/api/users/login', { data: { email, password } }, LoginResponseSchema);
            // LoginResponseSchema validation ensures token exists
            return data?.token ?? data?.data?.token ?? data?.token;
        } catch (err) {
            if (err instanceof ApiError) throw err;
            throw new ApiError(String(err));
        }
    }
}
