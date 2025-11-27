import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Page object for the user registration page.
 *
 * Provides methods to interact with the registration form and verify
 * validation messages and navigation behavior.
 */
export class RegistrationPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly loginLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input#username, input[name="username"]');
    this.passwordInput = page.locator('input#password, input[name="password"]');
    this.confirmPasswordInput = page.locator(
      'input#confirmPassword, input[name="confirmPassword"]'
    );
    this.registerButton = page.locator('button[type="submit"]');
    this.loginLink = page.locator(
      'a:has-text("Login"), a:has-text("login"), a[href*="login"], a[href*="/login"]'
    );
    this.errorMessage = page
      .locator(
        '[role="alert"], .error, .alert, .alert-danger, .alert-warning, .text-danger, [data-testid="error-message"], .invalid-feedback'
      )
      .first();
  }

  /**
   * Navigate to the registration page.
   */
  async goto(): Promise<void> {
    await super.goto('/register');
  }

  /**
   * Fill out and submit the registration form.
   */
  async register(username: string, password: string, confirmPassword?: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);

    if (confirmPassword !== undefined) {
      await this.fill(this.confirmPasswordInput, confirmPassword);
    }

    await this.click(this.registerButton);
  }

  /**
   * Navigate to the login page via the login link.
   */
  async goToLogin(): Promise<void> {
    await this.click(this.loginLink);
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
