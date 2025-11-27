import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Page object for the authenticated notes application.
 *
 * Provides methods to interact with the main app interface after
 * successful authentication, including logout and navigation.
 */
export class NotesAppPage extends BasePage {
  readonly logoutButton: Locator;
  readonly addNoteButton: Locator;
  readonly profileLink: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.locator(
      'button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]'
    );
    this.addNoteButton = page.locator(
      'button:has-text("Add Note"), button:has-text("New Note"), [data-testid="add-note"]'
    );
    this.profileLink = page.locator('a:has-text("Profile"), [data-testid="profile"]');
    this.pageHeading = page.locator('h1, h2, [data-testid="page-title"]');
  }

  /**
   * Navigate directly to the notes app (requires authentication).
   */
  async goto(): Promise<void> {
    await super.goto('/notes/app');
  }

  /**
   * Click the logout button to end the session.
   */
  async logout(): Promise<void> {
    await this.click(this.logoutButton);
  }

  /**
   * Check if the user is authenticated by verifying the logout button is visible.
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.isVisible(this.logoutButton);
  }

  /**
   * Get the page heading text.
   */
  async getHeading(): Promise<string> {
    return await this.getText(this.pageHeading);
  }

  /**
   * Wait for the app to fully load.
   */
  async waitForApp(): Promise<void> {
    await this.waitForLoadState('domcontentloaded');
    await this.waitForVisible(this.logoutButton);
  }
}
