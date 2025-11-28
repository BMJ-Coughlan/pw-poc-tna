# Accessibility Testing

Automated WCAG 2.1 Level AA compliance testing using axe-core.

## Why Quarantined

The practice site has color-contrast violations (SERIOUS severity) on footer elements that fail WCAG 2 AA minimum contrast ratio requirements. These tests successfully detect real accessibility issues but are quarantined because they fail due to third-party site issues outside our control.

**Found violations:** Color contrast issues on footer links (4 elements failing WCAG 2 AA standards)

## What This Demonstrates

- **WCAG Compliance Testing** — Automated checks for accessibility standards
- **axe-core Integration** — Industry-standard accessibility testing engine
- **Comprehensive Coverage** — Login, registration, dashboard, form errors, keyboard navigation
- **Violation Reporting** — Detailed output with severity levels, help URLs, and affected elements
- **Shift-Left Quality** — Catching accessibility issues in CI before production

## Why Accessibility Testing Matters

- **Legal Compliance** — ADA, Section 508, WCAG requirements
- **User Experience** — 15% of world population has some form of disability
- **SEO Benefits** — Semantic HTML improves search rankings
- **Code Quality** — Well-structured, semantic markup

## Running Locally

```powershell
# Run all accessibility tests
npx playwright test --grep @a11y

# Run smoke accessibility checks only
npx playwright test --grep "@a11y.*@smoke"

# Run with UI mode to see violations
npx playwright test tests/e2e/accessibility.spec.ts --ui

# Run single test
npx playwright test -g "login page should pass"
```

## Test Coverage

- ✅ **Login page** — Form accessibility, labels, contrast
- ✅ **Registration page** — Multi-field form accessibility
- ✅ **Dashboard page** — Authenticated state accessibility
- ✅ **Error states** — aria-invalid, aria-describedby validation
- ✅ **Keyboard navigation** — Tab order, focus management
- ✅ **Complete user flow** — Accessibility across journey

## Severity Levels

axe-core reports violations at 4 levels:

- 🔴 **Critical** — Severe impact, blocks users entirely
- 🟠 **Serious** — Significant barrier, major usability issue
- 🟡 **Moderate** — Noticeable impact, should be fixed
- 🔵 **Minor** — Small impact, nice-to-have fix

Tests fail on **Critical** or **Serious** violations only.

## Example Violations Found

### Color Contrast (SERIOUS)

```
[SERIOUS] color-contrast
  Ensure the contrast between foreground and background colors meets
  WCAG 2 AA minimum contrast ratio thresholds

  Affected elements: 4
    - <a href="..." class="btn btn-expand btn-sm">Buy us a coffee</a>
    - <a class="my-link" href="...">Expand Testing</a>
    - <span class="fc-faq-label">Learn more</span>
```

**Impact:** Users with visual impairments or color blindness cannot read text.

**Fix:** Increase contrast ratio to at least 4.5:1 for normal text, 3:1 for large text.

## Helper Functions

### `scanForAccessibilityViolations(page, options?)`

Runs comprehensive accessibility scan on current page.

```typescript
const results = await scanForAccessibilityViolations(page, {
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  exclude: ['ins.adsbygoogle'], // Exclude third-party content
});

console.log(`Found ${results.violations.length} violations`);
console.log(`Passed ${results.passes} checks`);
```

### `getCriticalViolations(violations)`

Filters to critical/serious violations only.

```typescript
const critical = getCriticalViolations(results.violations);
expect(critical.length).toBe(0);
```

### `formatViolations(violations)`

Formats violations for readable console output.

```typescript
console.log(formatViolations(critical));
// Outputs detailed violation info with help URLs
```

### `getAccessibilitySummary(result)`

Returns summary with counts by severity.

```typescript
console.log(getAccessibilitySummary(results));
// Displays pass/fail counts and violation breakdown
```

## WCAG Tags

Common tag combinations:

- `['wcag2a']` — WCAG 2.0 Level A (minimum)
- `['wcag2aa']` — WCAG 2.0 Level AA (standard)
- `['wcag21aa']` — WCAG 2.1 Level AA (current best practice)
- `['wcag2aaa']` — WCAG 2.0 Level AAA (enhanced)
- `['best-practice']` — Industry best practices beyond WCAG

## Excluding Third-Party Content

Google Ads and other third-party content often have violations outside your control:

```typescript
const results = await scanForAccessibilityViolations(page, {
  exclude: [
    'ins.adsbygoogle', // Google Ads
    'iframe[src*="google"]', // Google iframes
    '.third-party-widget', // Custom widgets
  ],
});
```

## CI Integration

Tests are excluded from CI via `@quarantine` tag until the SUT resolves violations.

**To enable in CI** (when testing accessible apps):

1. Remove `@quarantine` tag from test.describe
2. Tests will run on every PR/push
3. CI fails if critical/serious violations found
4. Violations visible in test reports with help URLs

## Best Practices

✅ **Test early and often** — Run on every page/component
✅ **Focus on critical violations** — Don't let minor issues block builds
✅ **Provide context** — Log violations with remediation links
✅ **Exclude third-party content** — Don't fail on code you don't control
✅ **Test user flows** — Check accessibility across journeys, not just pages
✅ **Validate error states** — Ensure error messages are screen-reader accessible
✅ **Test keyboard navigation** — Verify all functionality works without mouse

## Resources

- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
