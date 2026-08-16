import { BasePage } from '@core/pages/BasePage';

export class InventoryPage extends BasePage {
  readonly addBackpackToCartButton = this.elements.button({
    selector: '[data-test="add-to-cart-sauce-labs-backpack"]',
    description: 'Add to cart button on the Sauce Labs Backpack product card in the inventory grid',
  });

  readonly cartLink = this.elements.link({
    selector: '[data-test="shopping-cart-link"]',
    description: 'Shopping cart icon link in the page header, top right',
  });

  readonly cartBadge = this.elements.text({
    selector: '[data-test="shopping-cart-badge"]',
    description: 'Small numeric badge on the cart icon showing the item count',
  });

  async addBackpackToCart(): Promise<void> {
    await this.addBackpackToCartButton.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async getCartItemCount(): Promise<string> {
    return this.cartBadge.getText();
  }
}
