import { Page, Locator } from '@playwright/test';

/**
 * Base page object providing common functionality for all page objects.
 *
 * Encapsulates shared patterns like navigation, waiting, and element interactions
 * to reduce duplication and ensure consistency across page objects.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path relative to the base URL.
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for the page to reach a specific load state.
   */
  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Fill a text input with the given value.
   */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /**
   * Click an element.
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Get the current URL of the page.
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for a locator to be visible.
   */
  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  /**
   * Check if a locator is visible.
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Get the text content of a locator.
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }
}
