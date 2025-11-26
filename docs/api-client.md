# API Client Architecture (Playwright Proof-of-Concept)

I designed this project as a lightweight proof-of-concept to demonstrate disciplined API client design for Playwright-based contract, API, E2E, and hybrid tests. The goal is to show clear structure, strong typing, and patterns that I can explain in a portfolio.

## Goals

- Maintain a strong separation of concerns: a small `BaseApi` handles request/response plumbing and per-resource clients contain domain logic.
- Validate contracts using Zod schemata for request and response shapes.
- Integrate natively with Playwright via `APIRequestContext` for live HTTP calls inside tests.
- Make components testable: keep classes small so they can be unit-tested with a mocked `APIRequestContext`.

## Layout

- `lib/apis/` — API clients organized by resource (`baseApi.ts`, `usersApi.ts`, etc.)
  - `baseApi.ts` wraps Playwright `APIRequestContext` and provides `get/post/patch/delete` helpers, envelope unwrapping, error handling, and optional Zod validation.
  - `usersApi.ts` — Resource client for Users (register, login, profile, logout).

- `lib/schemas/` — Centralized Zod schemas for request/response validation (`authSchemas.ts`, etc.)

- `lib/fixtures/` — Playwright fixtures that instantiate API clients and provide test utilities (`testBase.ts`)

- `lib/pages/` — Page Object Models for UI testing (future)

- `tests/api/` — API and contract tests

- `tests/e2e/` — End-to-end UI tests (future)

## Patterns and Rationale

- Centralize cross-cutting behavior in `BaseApi` so resource clients remain focused and expressive.
- Use Zod for both outgoing request validation (to catch test-side bugs) and incoming response validation (to detect contract drift).
- Keep resource clients single-purpose — map each client to a REST resource (Users, Notes, etc.).
- Use fixtures to provide ready-to-use instances for tests instead of constructing clients inside tests.

## Examples

- Register a user (in tests, via fixture):

```ts
// uses UsersApi from fixture
await authAPI.register({ name, email, password });
const token = await authAPI.login(email, password);
```

- Validate a server response with a schema when posting:

```ts
const user = await base.post('/users/register', { data: userReq }, RegisterResponseSchema);
```

## Extending

- Add `notesApi.ts` following the `UsersApi` pattern.
- Add unit tests for `BaseApi` and `UsersApi` using a mocked `APIRequestContext`.

## Portfolio value

- This layout demonstrates:
  - Dependency injection (pass request context / base client into resource client)
  - Contract-first testing (Zod schemata validate contracts)
  - Playwright-native API usage (no separate HTTP library required)

## API contract

This section documents the concrete API shapes that this proof-of-concept expects and validates at runtime using Zod.

- **Base path used by the clients:** `/notes/api`
- **Envelope shape:** many endpoints return an envelope such as:

```json
{
  "data": {
    /* resource payload */
  },
  "status": 200,
  "message": "OK"
}
```

- `BaseApi` prefers the `data` property when unwrapping responses; schemata often use `.passthrough()` to tolerate additional envelope metadata.
- **Error semantics:** non-2xx responses cause `ApiError` to be thrown with `status` and the parsed `body`.

### Key endpoints (POC)

- `POST /notes/api/users/register`
  - Request: `{ name, email, password }`
  - Example response (envelope):

```json
{
  "data": {
    "id": "123",
    "name": "Test User",
    "email": "test@example.com"
  },
  "status": 201
}
```

- `POST /notes/api/users/login`
  - Request: `{ email, password }`
  - Example responses supported by the client:

```json
// nested token
{ "data": { "token": "..." } }

// or top-level token
{ "token": "..." }
```

Clients and tests should prefer extracting `data?.token` and fall back to `token` for compatibility.

### Usage snippet

```ts
// In a fixture or test
await authAPI.register({ name, email, password });
const token = await authAPI.login(email, password);
// Inject token into browser cookie for authenticated UI interactions
```

### Notes on side effects

- The POC interacts with a live SUT and may create real users; use test-specific accounts and clean up where appropriate.
