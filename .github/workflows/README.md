# GitHub Actions CI/CD

## Workflow: Playwright Tests

**File:** `.github/workflows/playwright-tests.yml`

### Triggers

1. **Automatic (Push/PR to develop):**
   - Runs on every push to `develop` branch
   - Runs on pull requests targeting `develop` branch

2. **Manual (workflow_dispatch):**
   - Can be triggered manually from GitHub Actions UI
   - Accepts optional `tags` parameter for filtered test execution

### Manual Run Instructions

1. Go to **Actions** tab in GitHub
2. Select **Playwright Tests** workflow
3. Click **Run workflow** button
4. (Optional) Enter test tags in the input field:
   - Leave empty to run all tests
   - Use `@smoke` to run smoke tests only
   - Use `@regression` for regression suite
   - Use any grep pattern to filter tests

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
- Test traces uploaded on failure (7-day retention)
- Separate artifacts per browser for easy debugging

**Result Summary:**

- Aggregates results from all browser matrix jobs
- Clear pass/fail status in workflow summary
- Downloads all reports for inspection

### Configuration

#### GitHub Variables (Optional)

Set these in **Settings → Secrets and variables → Actions → Variables**:

```
BASE_URL=https://practice.expandtesting.com
COOKIE_DOMAIN=practice.expandtesting.com
E2E_TEST_PASSWORD=TestPassword123!
E2E_WRONG_PASSWORD=WrongPassword456!
E2E_CORRECT_PASSWORD=CorrectPassword123!
API_TEST_PASSWORD=password123
E2E_INVALID_USERNAME=nonexistentuser123456
E2E_VALIDATION_USERNAME=testuser
```

**Note:** If variables are not set, workflow uses defaults matching `.env` file.

#### Workflow Settings

- **Timeout:** 15 minutes per job
- **Fail-fast:** Disabled (all browsers run even if one fails)
- **Retry:** Configured in `playwright.config.ts` (2 retries on CI)
- **Workers:** Configured in `playwright.config.ts` (2 workers on CI)

### Viewing Results

**HTML Reports:**

1. Go to failed/completed workflow run
2. Scroll to **Artifacts** section
3. Download `playwright-report-{browser}` artifact
4. Extract and open `index.html` in browser

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
