import { test, expect } from '@playwright/test';
import {
  scanForAccessibilityViolations,
  getCriticalViolations,
  formatViolations,
  getAccessibilitySummary,
} from '../../lib/helpers/accessibilityHelpers';

/**
 * Accessibility Testing Suite
 *
 * Tests WCAG 2.1 Level AA compliance for critical user flows
 * Uses axe-core to detect accessibility violations
 *
 * QUARANTINED: Practice site has color-contrast violations on footer links.
 * These tests demonstrate the accessibility testing approach and successfully
 * detect real WCAG violations. In a controlled environment, these would be
 * part of the standard test suite.
 *
 * Violations found: color-contrast (SERIOUS) - footer links fail WCAG 2 AA contrast ratio
 */

test.describe('Accessibility Testing @quarantine', () => {
  test.describe.configure({ mode: 'parallel' });

  test('login page should pass critical accessibility checks @a11y @smoke', async ({ page }) => {
    await page.goto('/login');

    const results = await scanForAccessibilityViolations(page, {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    });

    // Log summary for visibility
    console.log(getAccessibilitySummary(results));

    // Get critical/serious violations
    const criticalViolations = getCriticalViolations(results.violations);

    if (criticalViolations.length > 0) {
      console.log('\n⚠️  Critical/Serious Violations Found:');
      console.log(formatViolations(criticalViolations));
    }

    // Assert - expect no critical or serious violations
    // (This will likely fail on the practice site, which is intentional for demonstration)
    expect(
      criticalViolations.length,
      `Login page has ${criticalViolations.length} critical/serious accessibility violations. See console output for details.`
    ).toBe(0);
  });

  test('registration page should pass critical accessibility checks @a11y @smoke', async ({
    page,
  }) => {
    await page.goto('/register');

    const results = await scanForAccessibilityViolations(page, {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    });

    console.log(getAccessibilitySummary(results));

    const criticalViolations = getCriticalViolations(results.violations);

    if (criticalViolations.length > 0) {
      console.log('\n⚠️  Critical/Serious Violations Found:');
      console.log(formatViolations(criticalViolations));
    }

    expect(
      criticalViolations.length,
      `Registration page has ${criticalViolations.length} critical/serious accessibility violations. See console output for details.`
    ).toBe(0);
  });

  test('dashboard page should pass critical accessibility checks @a11y', async ({ page }) => {
    // Register and login to access dashboard
    await page.goto('/register');

    const timestamp = Date.now();
    const testEmail = `a11y-test-${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('**/notes/app');

    const results = await scanForAccessibilityViolations(page, {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      // Exclude Google Ads if present
      exclude: ['ins.adsbygoogle'],
    });

    console.log(getAccessibilitySummary(results));

    const criticalViolations = getCriticalViolations(results.violations);

    if (criticalViolations.length > 0) {
      console.log('\n⚠️  Critical/Serious Violations Found:');
      console.log(formatViolations(criticalViolations));
    }

    expect(
      criticalViolations.length,
      `Dashboard page has ${criticalViolations.length} critical/serious accessibility violations. See console output for details.`
    ).toBe(0);
  });

  test('complete user flow maintains accessibility @a11y @e2e', async ({ page }) => {
    // Test accessibility across a complete user journey
    const timestamp = Date.now();
    const testEmail = `a11y-flow-${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';
    const violations: { page: string; count: number; critical: number }[] = [];

    // 1. Login page
    await page.goto('/login');
    let results = await scanForAccessibilityViolations(page, { tags: ['wcag2aa'] });
    let critical = getCriticalViolations(results.violations);
    violations.push({ page: 'login', count: results.violations.length, critical: critical.length });

    // 2. Registration page
    await page.goto('/register');
    results = await scanForAccessibilityViolations(page, { tags: ['wcag2aa'] });
    critical = getCriticalViolations(results.violations);
    violations.push({
      page: 'register',
      count: results.violations.length,
      critical: critical.length,
    });

    // 3. Register new user
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/notes/app');

    // 4. Dashboard
    results = await scanForAccessibilityViolations(page, {
      tags: ['wcag2aa'],
      exclude: ['ins.adsbygoogle'],
    });
    critical = getCriticalViolations(results.violations);
    violations.push({
      page: 'dashboard',
      count: results.violations.length,
      critical: critical.length,
    });

    // Summary report
    console.log('\n📊 Accessibility Flow Report:');
    console.log('================================');
    violations.forEach((v) => {
      console.log(`${v.page.padEnd(12)} - ${v.count} violations (${v.critical} critical/serious)`);
    });
    console.log('================================');

    const totalCritical = violations.reduce((sum, v) => sum + v.critical, 0);

    expect(
      totalCritical,
      `User flow has ${totalCritical} critical/serious violations across ${violations.length} pages. Check console for details.`
    ).toBe(0);
  });

  test('form error states maintain accessibility @a11y @validation', async ({ page }) => {
    // Test that error states are accessible (screen reader friendly)
    await page.goto('/login');

    // Submit empty form to trigger errors
    await page.click('button[type="submit"]');

    // Wait for error messages to appear
    await page.waitForSelector('.error-message, .error, [role="alert"]', { state: 'visible' });

    const results = await scanForAccessibilityViolations(page, {
      tags: ['wcag2a', 'wcag2aa'],
    });

    console.log(getAccessibilitySummary(results));

    // Check for aria-invalid, aria-describedby on error fields
    const emailInput = page.locator('input[name="email"]');

    // These are best practices - may not be implemented on practice site
    const hasAriaInvalid = await emailInput.getAttribute('aria-invalid');
    const hasAriaDescribedBy = await emailInput.getAttribute('aria-describedby');

    console.log('\n📋 Form Accessibility Features:');
    console.log(`  aria-invalid: ${hasAriaInvalid || 'not set'}`);
    console.log(`  aria-describedby: ${hasAriaDescribedBy || 'not set'}`);

    const criticalViolations = getCriticalViolations(results.violations);

    if (criticalViolations.length > 0) {
      console.log('\n⚠️  Critical/Serious Violations Found:');
      console.log(formatViolations(criticalViolations));
    }

    expect(criticalViolations.length).toBe(0);
  });

  test('keyboard navigation works on login form @a11y @keyboard', async ({ page }) => {
    // Test that forms are keyboard accessible (Tab, Enter)
    await page.goto('/login');

    // Tab through form fields
    await page.keyboard.press('Tab'); // Focus email
    await page.keyboard.type('test@example.com');

    await page.keyboard.press('Tab'); // Focus password
    await page.keyboard.type('Password123!');

    await page.keyboard.press('Tab'); // Focus submit button

    // Check that submit button is focused
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBe('BUTTON');

    // Run accessibility scan
    const results = await scanForAccessibilityViolations(page, {
      tags: ['wcag2a', 'wcag2aa'],
    });

    const criticalViolations = getCriticalViolations(results.violations);

    if (criticalViolations.length > 0) {
      console.log('\n⚠️  Critical/Serious Violations Found:');
      console.log(formatViolations(criticalViolations));
    }

    expect(criticalViolations.length).toBe(0);
  });
});
