import { BasePage } from '@core/pages/BasePage';

export class CartPage extends BasePage {
  readonly firstItemName = this.elements.text({
    selector: '[data-test="inventory-item-name"]',
    description: 'Product name of the first line item in the cart list',
  });

  readonly checkoutButton = this.elements.button({
    selector: '[data-test="checkout"]',
    description: 'Checkout button at the bottom of the cart page',
  });

  async getFirstItemName(): Promise<string> {
    return this.firstItemName.getText();
  }
}
