import { BasePage } from '@core/pages/BasePage';
import { Button } from '@core/elements/Button';

export class CheckoutOverviewPage extends BasePage {
  readonly urlPath = '/checkout-step-two.html';

  readonly finishButton = new Button(
    this.page,
    { selector: '[data-test="finish"]', description: 'Finish button at the bottom of the checkout order overview' },
    this.healer,
  );

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
