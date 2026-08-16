import { BasePage } from '@core/pages/BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput = this.elements.input({
    selector: '[data-test="username"]',
    description: 'Username text field on the SauceDemo login form',
  });

  readonly passwordInput = this.elements.input({
    selector: '[data-test="password"]',
    description: 'Password text field on the SauceDemo login form',
  });

  readonly loginButton = this.elements.button({
    selector: '[data-test="login-button"]',
    description: 'Login submit button below the username/password fields',
  });

  readonly errorMessage = this.elements.text({
    selector: '[data-test="error"]',
    description: 'Error banner shown above the login form on a failed login attempt',
  });

  async open(): Promise<void> {
    await this.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
