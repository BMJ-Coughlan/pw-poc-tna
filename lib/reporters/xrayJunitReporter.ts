/**
 * Custom JUnit reporter that encodes Xray test keys in the classname attribute.
 *
 * Xray Cloud maps tests using the classname field. This reporter extracts
 * 'xray' annotations from testInfo and prepends the key to the classname.
 *
 * Example output:
 *   <testcase name="..." classname="XSP-54::e2e\registration.spec.ts" />
 *
 * This allows Xray to link automated test results to existing manual Test issues.
 */

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class XrayJUnitReporter implements Reporter {
  private config!: FullConfig;
  private suite!: Suite;
  private results: Map<TestCase, TestResult[]> = new Map();

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.suite = suite;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (!this.results.has(test)) {
      this.results.set(test, []);
    }
    this.results.get(test)!.push(result);
  }

  async onEnd(_result: FullResult) {
    const outputFile = path.join(this.config.rootDir, 'test-results', 'junit-xray.xml');
    const outputDir = path.dirname(outputFile);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const xml = this.generateJUnitXML();
    fs.writeFileSync(outputFile, xml, 'utf-8');
    console.log(`Xray JUnit XML written to: ${outputFile}`);
  }

  private generateJUnitXML(): string {
    const suites: string[] = [];
    let totalTests = 0;
    let totalFailures = 0;
    let totalSkipped = 0;
    let totalTime = 0;

    for (const suite of this.suite.suites) {
      const { xml, stats } = this.generateTestSuite(suite);
      if (stats.tests > 0) {
        suites.push(xml);
        totalTests += stats.tests;
        totalFailures += stats.failures;
        totalSkipped += stats.skipped;
        totalTime += stats.time;
      }
    }

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<testsuites tests="${totalTests}" failures="${totalFailures}" skipped="${totalSkipped}" time="${totalTime.toFixed(3)}">`,
      ...suites,
      '</testsuites>',
    ].join('\n');
  }

  private generateTestSuite(suite: Suite): {
    xml: string;
    stats: { tests: number; failures: number; skipped: number; time: number };
  } {
    const tests: string[] = [];
    let testCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    let totalTime = 0;

    for (const test of suite.allTests()) {
      const results = this.results.get(test) || [];
      if (results.length === 0) continue;

      testCount++;
      const lastResult = results[results.length - 1];
      totalTime += lastResult.duration;

      if (lastResult.status === 'skipped') {
        skippedCount++;
      } else if (lastResult.status === 'failed' || lastResult.status === 'timedOut') {
        failureCount++;
      }

      // Extract Xray test key from annotations
      const xrayAnnotation = test.annotations.find((a) => a.type === 'xray');
      const xrayKey = xrayAnnotation?.description;

      // Build classname: prepend Xray key if present
      const relativePath = path.relative(this.config.rootDir, test.location.file);
      const classname = xrayKey ? `${xrayKey}::${relativePath}` : relativePath;

      tests.push(this.generateTestCase(test, lastResult, classname));
    }

    const suiteName = suite.title || path.relative(this.config.rootDir, suite.location?.file || '');
    const xml = [
      `<testsuite name="${this.escapeXml(suiteName)}" tests="${testCount}" failures="${failureCount}" skipped="${skippedCount}" time="${totalTime.toFixed(3)}">`,
      ...tests,
      '</testsuite>',
    ].join('\n');

    return {
      xml,
      stats: { tests: testCount, failures: failureCount, skipped: skippedCount, time: totalTime },
    };
  }

  private generateTestCase(test: TestCase, result: TestResult, classname: string): string {
    const name = test.title;
    const time = (result.duration / 1000).toFixed(3);

    const parts = [
      `<testcase name="${this.escapeXml(name)}" classname="${this.escapeXml(classname)}" time="${time}">`,
    ];

    if (result.status === 'failed' || result.status === 'timedOut') {
      const error = result.error?.message || 'Test failed';
      const stack = result.error?.stack || '';
      parts.push(`  <failure message="${this.escapeXml(error)}">`);
      parts.push(`    <![CDATA[${stack}]]>`);
      parts.push('  </failure>');
    } else if (result.status === 'skipped') {
      parts.push('  <skipped/>');
    }

    parts.push('</testcase>');
    return parts.join('\n');
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export default XrayJUnitReporter;
