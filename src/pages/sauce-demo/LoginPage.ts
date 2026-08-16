import { BasePage } from '@core/pages/BasePage';
import { Input } from '@core/elements/Input';
import { Button } from '@core/elements/Button';
import { Text } from '@core/elements/Text';

export class LoginPage extends BasePage {
  readonly urlPath = '/';

  readonly usernameInput = new Input(
    this.page,
    { selector: '[data-test="username"]', description: 'Username text field on the SauceDemo login form' },
    this.healer,
  );

  readonly passwordInput = new Input(
    this.page,
    { selector: '[data-test="password"]', description: 'Password text field on the SauceDemo login form' },
    this.healer,
  );

  readonly loginButton = new Button(
    this.page,
    { selector: '[data-test="login-button"]', description: 'Login submit button below the username/password fields' },
    this.healer,
  );

  readonly errorMessage = new Text(
    this.page,
    {
      selector: '[data-test="error"]',
      description: 'Error banner shown above the login form on a failed login attempt',
    },
    this.healer,
  );

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
