import { BasePage } from '@core/pages/BasePage';
import { Button } from '@core/elements/Button';
import { Text } from '@core/elements/Text';

export class CartPage extends BasePage {
  readonly urlPath = '/cart.html';

  readonly firstItemName = new Text(
    this.page,
    { selector: '[data-test="inventory-item-name"]', description: 'Product name of the first line item in the cart list' },
    this.healer,
  );

  readonly checkoutButton = new Button(
    this.page,
    { selector: '[data-test="checkout"]', description: 'Checkout button at the bottom of the cart page' },
    this.healer,
  );

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
