# GitHub Actions CI/CD

## Workflow: Playwright Tests

**File:** `.github/workflows/playwright-tests.yml`

### Triggers

1. **Automatic (Push/PR to develop and main):**
   - Runs on every push to `develop` or `main` branch
   - Runs on pull requests targeting `develop` or `main` branch
   - **Smart test selection based on branch:**
     - **main branch** → `@regression` tests (comprehensive validation)
     - **develop branch** → All tests (full suite)
     - **Pull Requests** → `@smoke` tests (fast feedback)
     - **Feature branches** → `@smoke` tests (quick validation)

2. **Manual (workflow_dispatch):**
   - Can be triggered manually from GitHub Actions UI
   - Accepts optional `tags` parameter for custom test filtering
   - Accepts `environment` parameter to select configuration group

### Test Tags

Tests are organized with the following tags for flexible filtering:

**Suite Tags:**

- `@api` — All API tests (16 tests)
- `@e2e` — All E2E UI tests (11 tests)

**Category Tags:**

- `@smoke` — Critical happy path tests (4 tests: 2 API + 2 E2E)
- `@regression` — Validation and edge case tests
- `@validation` — Form/input validation specific tests

**Example Tag Combinations:**

```bash
@smoke              # Run only smoke tests (4 tests)
@api                # Run all API tests (16 tests)
@e2e                # Run all E2E tests (11 tests)
@regression         # Run all regression tests
@api.*@smoke        # API smoke tests only
@e2e.*@smoke        # E2E smoke tests only
@validation         # All validation tests
```

### Manual Run Instructions

1. Go to **Actions** tab in GitHub
2. Select **Playwright Tests** workflow
3. Click **Run workflow** button
4. **Select branch** to run tests against
5. **(Optional) Configure test tags:**
   - Leave empty to use auto-select based on branch
   - Use `@smoke` to run smoke tests only (4 tests)
   - Use `@api` for API tests only (15 tests)
   - Use `@e2e` for E2E tests only (11 tests)
   - Use `@regression` for regression suite
   - Combine with `.*` for AND logic: `@api.*@smoke`
6. **(Optional) Select environment:**
   - **auto** (default) — Automatically selects based on branch
     - `main` → Production
     - `develop` → Staging
     - PRs/feature branches → Development
   - **production** — Use production environment variables
   - **staging** — Use staging environment variables
   - **development** — Use development environment variables
7. Click **"Run workflow"**

### Branch-Based Test Strategy

The workflow automatically selects appropriate tests based on the branch:

| Branch/Event     | Test Strategy | Tags Applied  | Rationale                                  |
| ---------------- | ------------- | ------------- | ------------------------------------------ |
| `main`           | Regression    | `@regression` | Comprehensive validation before production |
| `develop`        | Full Suite    | _(all tests)_ | Complete testing on integration branch     |
| Pull Requests    | Smoke Tests   | `@smoke`      | Fast feedback for code reviews             |
| Feature Branches | Smoke Tests   | `@smoke`      | Quick validation during development        |

**Override:** Manual workflow dispatch with explicit tags overrides automatic selection.

### Features

**Cross-Browser Testing:**

- Runs tests in parallel across 3 browsers: Chromium, Firefox, WebKit
- Uses matrix strategy for efficient execution

**Quality Checks:**

- TypeScript type checking (`npm run typecheck`)
- ESLint linting (`npm run lint`)
- Playwright test execution

**Environment Variables:**

- Uses GitHub Variables with fallback to default values
- Configuration matches local `.env` file
- All test credentials configurable via repository settings

**Artifacts:**

- Test reports uploaded for all runs (7-day retention)
- JUnit XML results for each browser (7-day retention)
- Test traces uploaded on failure (7-day retention)
- Separate artifacts per browser for easy debugging

**Test Result Reporting:**

- **Interactive UI in GitHub Actions** — Test results displayed in Checks tab with:
  - Pass/fail rates and trends
  - Test duration metrics
  - Detailed failure information
  - Comparison with previous runs
- **Per-browser results** — Individual check for each browser (chromium, firefox, webkit)
- **Combined summary** — Aggregated results across all browsers
- **PR comments** — Test results automatically posted on pull requests (if enabled)

**Result Summary:**

- Aggregates results from all browser matrix jobs
- Clear pass/fail status in workflow summary
- Downloads all reports for inspection

### Configuration

#### Environment Variable Groups (Like Azure DevOps!)

The workflow uses environment variable groups similar to Azure DevOps, defined at the workflow level:

**Production Environment:**

```yaml
PROD_BASE_URL: 'https://practice.expandtesting.com'
PROD_COOKIE_DOMAIN: 'practice.expandtesting.com'
```

**Staging Environment:**

```yaml
STAGING_BASE_URL: 'https://practice.expandtesting.com'
STAGING_COOKIE_DOMAIN: 'practice.expandtesting.com'
```

**Development Environment:**

```yaml
DEV_BASE_URL: 'https://practice.expandtesting.com'
DEV_COOKIE_DOMAIN: 'practice.expandtesting.com'
```

**Test Credentials (Shared):**

```yaml
E2E_TEST_PASSWORD: 'TestPassword123!'
E2E_WRONG_PASSWORD: 'WrongPassword456!'
E2E_CORRECT_PASSWORD: 'CorrectPassword123!'
API_TEST_PASSWORD: 'password123'
E2E_INVALID_USERNAME: 'nonexistentuser123456'
E2E_VALIDATION_USERNAME: 'testuser'
```

**Benefits:**

- ✅ Centralized configuration in workflow file
- ✅ Easy to update URLs for different environments
- ✅ No need to configure GitHub Secrets/Variables
- ✅ Clear separation of environment-specific values
- ✅ Similar pattern to Azure DevOps variable groups

**To modify:** Edit the `env:` section at the top of `playwright-tests.yml`

#### GitHub Variables (Optional Override)

You can still override these via **Settings → Secrets and variables → Actions → Variables**:

```
BASE_URL=https://your-custom-url.com
COOKIE_DOMAIN=your-custom-domain.com
```

These will take precedence over the workflow-level environment groups when set.

#### Workflow Settings

- **Timeout:** 15 minutes per job
- **Fail-fast:** Disabled (all browsers run even if one fails)
- **Retry:** Configured in `playwright.config.ts` (2 retries on CI)
- **Workers:** Configured in `playwright.config.ts` (2 workers on CI)

### Viewing Results

**Interactive Test Report (GitHub UI):**

1. Go to workflow run in **Actions** tab
2. Click on **Checks** tab at the top
3. See interactive test results:
   - **Test Results (chromium/firefox/webkit)** — Per-browser breakdown
   - **Combined Test Results (All Browsers)** — Overall summary
   - Pass rates, duration, trends vs previous runs
   - Click on failed tests to see error details

**HTML Reports (Downloadable):**

1. Go to failed/completed workflow run
2. Scroll to **Artifacts** section
3. Download `playwright-report-{browser}` artifact
4. Extract and open `index.html` in browser

**JUnit XML Results:**

1. Download `junit-results-{browser}` artifact
2. Import into test management tools or CI dashboards
3. Compatible with Azure DevOps, Jenkins, etc.

**Test Traces (on failure):**

1. Download `playwright-traces-{browser}` artifact
2. Run `npx playwright show-trace trace.zip` locally
3. Interactive trace viewer opens in browser

### Local Testing

Test the CI configuration locally:

```bash
# Simulate CI environment
$env:CI = "true"
npm ci
npx playwright install --with-deps
npm run typecheck
npm run lint
npx playwright test

# Test specific browser (like CI matrix)
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Troubleshooting

**All tests failing:**

- Check if `BASE_URL` is accessible from GitHub Actions runners
- Verify environment variables are set correctly
- Check test results/traces artifacts for details

**Flaky tests:**

- Review trace files to see what happened
- Check if timing issues exist (CI is slower than local)
- Consider increasing timeouts or retries in `playwright.config.ts`

**Workflow not triggering:**

- Verify workflow file is in `main` or `develop` branch
- Check branch protection rules
- Ensure workflow has correct permissions
