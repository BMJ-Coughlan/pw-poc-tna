import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility testing helpers using axe-core
 *
 * Provides utilities for running WCAG compliance checks and analyzing violations
 */

export interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface AccessibilityScanResult {
  violations: AxeViolation[];
  passes: number;
  incomplete: number;
  inaccessible: number;
}

/**
 * Run accessibility scan on current page
 *
 * @param page - Playwright page instance
 * @param options - Axe scan options
 * @returns Scan results with violations and summary
 */
export async function scanForAccessibilityViolations(
  page: Page,
  options?: {
    tags?: string[]; // e.g., ['wcag2a', 'wcag2aa', 'wcag21aa']
    exclude?: string[]; // CSS selectors to exclude from scan
  }
): Promise<AccessibilityScanResult> {
  const builder = new AxeBuilder({ page });

  // Apply WCAG tags if specified
  if (options?.tags) {
    builder.withTags(options.tags);
  }

  // Exclude elements if specified (useful for third-party content)
  if (options?.exclude) {
    options.exclude.forEach((selector) => builder.exclude(selector));
  }

  const results = await builder.analyze();

  return {
    violations: results.violations as AxeViolation[],
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    inaccessible: results.violations.length,
  };
}

/**
 * Get critical and serious violations only
 *
 * @param violations - All violations from scan
 * @returns Filtered violations of critical or serious impact
 */
export function getCriticalViolations(violations: AxeViolation[]): AxeViolation[] {
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

/**
 * Format violations for readable output
 *
 * @param violations - Violations to format
 * @returns Formatted string for logging or assertions
 */
export function formatViolations(violations: AxeViolation[]): string {
  if (violations.length === 0) {
    return 'No accessibility violations found';
  }

  return violations
    .map((violation) => {
      const nodeCount = violation.nodes.length;
      const examples = violation.nodes
        .slice(0, 3)
        .map((node) => `    - ${node.html}`)
        .join('\n');

      return `
[${violation.impact.toUpperCase()}] ${violation.id}
  ${violation.description}
  Help: ${violation.helpUrl}
  Affected elements: ${nodeCount}
${examples}${nodeCount > 3 ? `\n    ... and ${nodeCount - 3} more` : ''}
`;
    })
    .join('\n');
}

/**
 * Assert that page has no critical or serious accessibility violations
 *
 * @param page - Playwright page instance
 * @param message - Optional custom assertion message
 * @throws Error with violation details if critical/serious violations found
 */
export async function assertNoAccessibilityViolations(page: Page, message?: string): Promise<void> {
  const results = await scanForAccessibilityViolations(page);
  const critical = getCriticalViolations(results.violations);

  if (critical.length > 0) {
    const formattedViolations = formatViolations(critical);
    const errorMessage = message
      ? `${message}\n\n${formattedViolations}`
      : `Found ${critical.length} critical/serious accessibility violation(s):\n${formattedViolations}`;

    throw new Error(errorMessage);
  }
}

/**
 * Get a summary of accessibility scan results
 *
 * @param result - Scan result to summarize
 * @returns Human-readable summary string
 */
export function getAccessibilitySummary(result: AccessibilityScanResult): string {
  const criticalCount = result.violations.filter((v) => v.impact === 'critical').length;
  const seriousCount = result.violations.filter((v) => v.impact === 'serious').length;
  const moderateCount = result.violations.filter((v) => v.impact === 'moderate').length;
  const minorCount = result.violations.filter((v) => v.impact === 'minor').length;

  return `
Accessibility Scan Summary:
  ✅ Passed checks: ${result.passes}
  ⚠️  Incomplete checks: ${result.incomplete}
  ❌ Failed checks: ${result.inaccessible}
  
Violations by severity:
  🔴 Critical: ${criticalCount}
  🟠 Serious: ${seriousCount}
  🟡 Moderate: ${moderateCount}
  🔵 Minor: ${minorCount}
`;
}
