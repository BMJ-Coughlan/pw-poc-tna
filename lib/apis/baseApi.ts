import { APIRequestContext, APIResponse } from '@playwright/test';
import { z } from 'zod';

/**
 * Optional response envelope returned by some endpoints.
 *
 * Many APIs use an envelope like `{ data: T, status, message }`. This type
 * models that envelope when present. Consumers typically read `data`.
 */
export type ResponseEnvelope<T> = {
  success?: boolean;
  status?: number;
  message?: string;
  data?: T;
};

/**
 * Options for API request methods.
 * Provides type safety for request configuration options.
 */
export interface ApiRequestOptions {
  data?: Record<string, unknown> | string;
  form?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean> | URLSearchParams | string;
  timeout?: number;
  failOnStatusCode?: boolean;
  ignoreHTTPSErrors?: boolean;
  maxRedirects?: number;
  maxRetries?: number;
}

/**
 * Generic API error thrown when requests fail or validation fails.
 *
 * - `status`: HTTP status code when available
 * - `body`: parsed response body or raw text for debugging
 */
export class ApiError extends Error {
  status?: number;
  body?: unknown;
  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * BaseApi — lightweight wrapper around Playwright's `APIRequestContext`.
 *
 * Responsibilities:
 * - Perform HTTP requests using the provided `APIRequestContext`.
 * - Unwrap common response envelopes (prefer `data`).
 * - Optionally validate response payloads with Zod schemas per-call.
 * - Throw `ApiError` for non-2xx responses.
 */
export class BaseApi {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Parse the raw response, handle non-2xx statuses, and optionally validate
   * the payload with a Zod schema. Returns the unwrapped payload (prefer
   * `data` if the response is an envelope).
   */
  private async parseAndValidate(response: APIResponse, schema?: z.ZodTypeAny) {
    const text = await response.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      body = text;
    }

    const status = response.status();
    if (status >= 400) {
      throw new ApiError(`Request failed with status ${status}`, status, body ?? text);
    }

    const payload =
      body && typeof body === 'object' && body !== null && 'data' in body
        ? (body as Record<string, unknown>).data
        : body;

    if (schema) {
      schema.parse(payload ?? body);
    }

    return payload;
  }

  /** Perform a GET request and optionally validate the response. */
  async get<T>(path: string, opts: ApiRequestOptions = {}, schema?: z.ZodTypeAny): Promise<T> {
    const res = await this.request.get(path, opts);
    return (await this.parseAndValidate(res, schema)) as T;
  }

  /** Perform a POST request and optionally validate the response. */
  async post<T>(path: string, opts: ApiRequestOptions = {}, schema?: z.ZodTypeAny): Promise<T> {
    const res = await this.request.post(path, opts);
    return (await this.parseAndValidate(res, schema)) as T;
  }

  /** Perform a PATCH request and optionally validate the response. */
  async patch<T>(path: string, opts: ApiRequestOptions = {}, schema?: z.ZodTypeAny): Promise<T> {
    const res = await this.request.patch(path, opts);
    return (await this.parseAndValidate(res, schema)) as T;
  }

  /** Perform a DELETE request and optionally validate the response. */
  async delete<T>(path: string, opts: ApiRequestOptions = {}, schema?: z.ZodTypeAny): Promise<T> {
    const res = await this.request.delete(path, opts);
    return (await this.parseAndValidate(res, schema)) as T;
  }
}
