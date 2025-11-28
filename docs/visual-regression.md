# Visual Regression Testing

⚠️ **QUARANTINED** — Excluded from CI due to third-party ads on the practice site.

## Why Quarantined?

Ads introduce non-determinism (content, size, timing). Visual diffs become noise.

SME view:

- Control the environment (no third‑party ads) or intercept ad domains.
- If not possible, use a visual platform (Percy/Chromatic/Applitools) with region ignores.
- Tagging: tests are marked `@visual @quarantine` to keep CI stable while preserving the technique.

What this work shows:

- Screenshot comparison with stable baselines
- Dynamic content masking for deterministic captures
- Cross‑viewport coverage (mobile/tablet/desktop)
- Practical `toHaveScreenshot()` usage
- Platform-specific baselines (e.g., `*-chromium-win32.png`) to avoid cross-platform noise

Why this approach: keep the technique visible in the portfolio, but quarantine it where the SUT isn’t deterministic.

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

Baseline images live in `tests/visual/*-snapshots/`.
Subsequent runs compare against baselines and fail if differences exceed thresholds (800px or 25%).

Failures include baseline/actual/diff in the HTML report (`npm run report`).

Tip: review diffs before accepting baseline changes; only update when the UI change is intentional.

## Key Techniques

**Hide dynamic content:**

```typescript
await page.addStyleTag({
  content: `.user-email, .last-login { visibility: hidden !important; }`,
});
```

**Wait for stability (prefer element readiness over pure network idle):**

```typescript
await page.waitForLoadState('networkidle');
```

**Configure thresholds (trade‑off: sensitivity vs flake):**

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
4. Consider uploading `*-diff.png` artifacts on failure for review
