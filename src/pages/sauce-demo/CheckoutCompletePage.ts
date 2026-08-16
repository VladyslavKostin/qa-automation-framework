import { BasePage } from '@core/pages/BasePage';
import { Text } from '@core/elements/Text';

export class CheckoutCompletePage extends BasePage {
  readonly urlPath = '/checkout-complete.html';

  readonly completeHeader = new Text(
    this.page,
    { selector: '[data-test="complete-header"]', description: 'Order confirmation headline on the checkout complete page' },
    this.healer,
  );
}
