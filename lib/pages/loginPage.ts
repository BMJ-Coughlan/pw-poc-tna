import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Page object for the login page.
 *
 * Provides methods to interact with the login form and verify
 * validation messages and navigation behavior.
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input#email, input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input#password, input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.registerLink = page.locator(
      'a:has-text("Register"), a:has-text("register"), a[href*="register"], a[href*="/register"]'
    );
    this.errorMessage = page
      .locator(
        '[role="alert"], .error, .alert, .alert-danger, .alert-warning, .text-danger, [data-testid="error-message"], .invalid-feedback'
      )
      .first();
    this.rememberMeCheckbox = page.locator(
      'input[type="checkbox"][name="remember"], input#remember-me'
    );
  }

  /**
   * Navigate to the login page.
   */
  async goto(): Promise<void> {
    await super.goto('/notes/app/login');
  }

  /**
   * Fill out and submit the login form.
   */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);

    if (rememberMe && (await this.rememberMeCheckbox.isVisible())) {
      await this.click(this.rememberMeCheckbox);
    }

    await this.click(this.loginButton);
  }

  /**
   * Navigate to the registration page via the register link.
   */
  async goToRegister(): Promise<void> {
    await this.click(this.registerLink);
  }

  /**
   * Get the error message text displayed on the page.
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if an error message is visible.
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }
}
