# Visual Regression Testing

⚠️ **QUARANTINED** — Excluded from CI due to third-party ads on the practice site.

## Why Quarantined?

The practice site has Google Ads that change on every run, causing pixel differences and making visual regression unreliable. Ads load different content, resize containers, and shift layouts unpredictably.

**For production use, you'd need:**

- Controlled environment without ads
- Network interception to block ad domains
- Dedicated visual platforms (Percy.io, Chromatic, Applitools)

**What this demonstrates:**

- Screenshot capture and comparison
- Dynamic content masking
- Cross-viewport testing (mobile, tablet, desktop)
- Playwright's `toHaveScreenshot()` API

## Running Locally

```powershell
npm run test:visual           # Run tests
npm run test:visual:update    # Update baselines
npm run test:visual:ui        # Debug in UI mode
```

## Test Coverage

- Login page (desktop + mobile viewport)
- Registration page
- Authenticated dashboard (desktop + tablet viewport)
- Error states (validation errors)
- Component-level screenshots (form elements)

## How It Works

First run generates baseline screenshots in `tests/visual/*-snapshots/`. Subsequent runs compare pixel-by-pixel and fail if differences exceed threshold (currently 800px or 25%).

Failed tests generate diff images viewable in the HTML report: `npm run report`

## Key Techniques

**Hide dynamic content:**

```typescript
await page.addStyleTag({
  content: `.user-email, .last-login { visibility: hidden !important; }`,
});
```

**Wait for stability:**

```typescript
await page.waitForLoadState('networkidle');
```

**Configure thresholds:**

```typescript
// playwright.config.ts
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 800,
    threshold: 0.25,
    animations: 'disabled'
  }
}
```

## CI Integration (Disabled)

The visual job is commented out in `.github/workflows/playwright-tests.yml`. To enable it:

1. Remove `@quarantine` tag from tests
2. Uncomment the `visual` job
3. Test against an ad-free environment
