# Visual Regression Testing

⚠️ **QUARANTINED**: These tests are currently excluded from CI/CD pipelines.

## Why Quarantined?

The practice testing site (`practice.expandtesting.com`) contains **third-party Google Ads** and dynamic advertising content. This creates several issues for visual regression testing:

1. **Pixel differences**: Ads load different images/content on each run
2. **Layout shifts**: Ad containers resize based on loaded content
3. **Timing variations**: Ads load asynchronously, causing race conditions
4. **Non-deterministic behavior**: Different ads appear based on targeting, location, time

These factors make pixel-perfect screenshot comparison inherently unreliable, causing false failures and making the tests unsuitable for CI/CD automation.

## Production Requirements

For visual regression to work reliably in production, you need:

**Option 1: Controlled Environment**

- Test environment without third-party ads
- Static content only (no dynamic advertising)
- Consistent layout and content on every run

**Option 2: Network Interception**

- Block ad domains via Playwright's `route()` API
- Mock ad responses with static placeholders
- Requires maintenance as ad networks change

**Option 3: Dedicated Visual Platforms**

- Percy.io, Chromatic, or Applitools
- Advanced diffing algorithms that ignore dynamic regions
- Manual baseline approval workflows
- Intelligent threshold tuning

## What This Demonstrates

Despite being quarantined, these tests showcase:

- Screenshot capture and comparison techniques
- Dynamic content masking strategies
- Cross-viewport testing (mobile, tablet, desktop)
- State-based visual testing (empty, error, authenticated)
- Component vs full-page screenshot approaches
- Playwright's `toHaveScreenshot()` API usage
- Professional test organization and documentation

## Overview

Visual regression tests capture screenshots of key pages and UI components, comparing them against baseline images to detect unintended visual changes. This catches CSS bugs, layout shifts, and design regressions that functional tests might miss.

## Test Coverage

**Critical Pages:**

- Login page (desktop + mobile)
- Registration page
- Authenticated dashboard (desktop + tablet)
- Error states (validation errors)
- Component-level (form elements)

## Running Visual Tests

### Run all visual tests

```powershell
npx playwright test tests/visual --project=chromium
```

### Run specific visual test

```powershell
npx playwright test tests/visual/critical-pages.spec.ts
```

### Update baselines (after intentional UI changes)

```powershell
npx playwright test tests/visual --update-snapshots
```

### Run in UI mode for debugging

```powershell
npx playwright test tests/visual --ui
```

## How It Works

### First Run - Generate Baselines

When you first run visual tests, Playwright creates baseline screenshots in:

```
tests/visual/critical-pages.spec.ts-snapshots/
├── login-page-chromium-win32.png
├── registration-page-chromium-win32.png
└── dashboard-authenticated-chromium-win32.png
```

Screenshots are platform and browser-specific (e.g., `chromium-win32`, `firefox-darwin`, `webkit-linux`).

### Subsequent Runs - Compare

On future runs, Playwright:

1. Captures new screenshots
2. Compares pixel-by-pixel with baselines
3. Generates diff images if changes detected
4. Fails the test if differences exceed threshold

### When Tests Fail

Failed visual tests generate three images:

- **Baseline** (`*-expected.png`) - Original baseline
- **Actual** (`*-actual.png`) - Current screenshot
- **Diff** (`*-diff.png`) - Highlighted differences

View these in the HTML report:

```powershell
npx playwright show-report
```

## Configuration

### Screenshot Options

Tests use these options for consistency:

```typescript
await expect(page).toHaveScreenshot('name.png', {
  fullPage: true, // Capture entire page (not just viewport)
  animations: 'disabled', // Disable CSS animations for stability
});
```

### Hiding Dynamic Content

Dynamic elements (timestamps, user IDs) are hidden to prevent false failures:

```typescript
await page.addStyleTag({
  content: `
    .user-email,
    .last-login {
      visibility: hidden !important;
    }
  `,
});
```

### Viewport Testing

Tests cover multiple viewports:

- **Desktop**: Default (1280x720)
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)

## Best Practices

### ✅ Do

- **Wait for stability** - Use `waitForLoadState('networkidle')` before screenshots
- **Hide dynamic content** - Timestamps, session IDs, user emails
- **Disable animations** - Prevents timing-based flakiness
- **Use descriptive names** - `login-page-error.png` not `screenshot1.png`
- **Test critical paths** - Login, registration, checkout, dashboard
- **Update baselines intentionally** - Review diffs before accepting changes

### ❌ Don't

- Screenshot pages with live data feeds (stock tickers, real-time updates)
- Include user-generated content without masking
- Run visual tests on every PR (they're slow) - use CI tags
- Commit baseline images to git if tests run on multiple OS/browsers

## CI/CD Integration

### Tagging Strategy

Visual tests use `@visual @quarantine` tags. The `@quarantine` tag excludes them from CI due to third-party ad interference.

### CI Job (Disabled)

⚠️ **The visual regression CI job is disabled** because these tests are unreliable on the practice site due to third-party ads.

The workflow includes a commented-out job that would run:

- On `main` and on manual dispatch
- On `windows-latest` to match committed `*-win32.png` baselines
- With Chromium only: `npx playwright test --project=chromium --grep @visual`
- Uploads `*-diff.png`, `*-actual.png`, `*-expected.png` as artifacts on failure

**To enable** (when running against ad-free environment):

1. Remove the `@quarantine` tag from `tests/visual/critical-pages.spec.ts`
2. Uncomment the `visual` job in `.github/workflows/playwright-tests.yml`
3. Update the `if:` condition to match your branching strategy

### Local Scripts

```powershell
npm run test:visual            # Run Chromium visual tests
npm run test:visual:update     # Update baselines intentionally
npm run test:visual:ui         # Debug in UI mode
```

### Artifact Storage

CI should upload failed screenshots as artifacts:

```yaml
- name: Upload visual test failures
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: visual-test-failures
    path: test-results/**/*-diff.png
```

### Baseline Management

**Option 1: Commit baselines (simple)**

- Store baselines in git
- CI uses committed baselines
- Update with `--update-snapshots` locally

**Option 2: Cloud storage (scalable)**

- Store baselines in S3/Azure Blob
- CI downloads baselines before running
- Update baselines via separate job

## Troubleshooting

### "Screenshot comparison failed"

- Review diff image in HTML report
- If change is intentional: `npx playwright test --update-snapshots`
- If unintentional: fix CSS/layout bug

### "Baseline not found"

- Run tests locally first to generate baselines
- Commit baseline images if using git storage
- Check platform-specific naming (win32 vs darwin vs linux)

### Flaky visual tests

- Add longer `waitForLoadState` timeout
- Hide more dynamic elements
- Use `maxDiffPixels` option for minor acceptable differences:
  ```typescript
  await expect(page).toHaveScreenshot('name.png', {
    maxDiffPixels: 100, // Allow up to 100 pixels difference
  });
  ```

### Cross-browser differences

- Fonts render differently on WebKit vs Chromium
- Use web-safe fonts for critical visual tests
- Or run visual tests on single browser (typically Chromium)

## Portfolio Value

This demonstrates:

- **Comprehensive testing** - Beyond functional to visual quality
- **Test stability** - Handling dynamic content, animations
- **Cross-device testing** - Mobile, tablet, desktop viewports
- **CI/CD integration** - Selective execution, artifact management
- **Professional approach** - Documentation, best practices, troubleshooting guide

## Future Enhancements

- [ ] Percy.io integration for visual diff UI
- [ ] Automatic baseline updates via PR bot
- [ ] Component library visual tests (Storybook integration)
- [ ] Accessibility contrast checking in screenshots
- [ ] Performance: only screenshot changed pages
