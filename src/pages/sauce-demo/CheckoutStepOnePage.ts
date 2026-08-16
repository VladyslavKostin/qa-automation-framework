import { BasePage } from '@core/pages/BasePage';
import { Input } from '@core/elements/Input';
import { Button } from '@core/elements/Button';
import type { CheckoutInfo } from '@entities/CheckoutInfo';

export class CheckoutStepOnePage extends BasePage {
  readonly urlPath = '/checkout-step-one.html';

  readonly firstNameInput = new Input(
    this.page,
    { selector: '[data-test="firstName"]', description: 'First name field on the checkout information form' },
    this.healer,
  );

  readonly lastNameInput = new Input(
    this.page,
    { selector: '[data-test="lastName"]', description: 'Last name field on the checkout information form' },
    this.healer,
  );

  readonly postalCodeInput = new Input(
    this.page,
    { selector: '[data-test="postalCode"]', description: 'Postal code field on the checkout information form' },
    this.healer,
  );

  readonly continueButton = new Button(
    this.page,
    { selector: '[data-test="continue"]', description: 'Continue button that submits the checkout information form' },
    this.healer,
  );

  async fillAndContinue(info: CheckoutInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
    await this.continueButton.click();
  }
}
