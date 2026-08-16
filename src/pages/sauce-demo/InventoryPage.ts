import { BasePage } from '@core/pages/BasePage';
import { Button } from '@core/elements/Button';
import { Link } from '@core/elements/Link';
import { Text } from '@core/elements/Text';

export class InventoryPage extends BasePage {
  readonly urlPath = '/inventory.html';

  readonly addBackpackToCartButton = new Button(
    this.page,
    {
      selector: '[data-test="add-to-cart-sauce-labs-backpack"]',
      description: 'Add to cart button on the Sauce Labs Backpack product card in the inventory grid',
    },
    this.healer,
  );

  readonly cartLink = new Link(
    this.page,
    {
      selector: '[data-test="shopping-cart-link"]',
      description: 'Shopping cart icon link in the page header, top right',
    },
    this.healer,
  );

  readonly cartBadge = new Text(
    this.page,
    {
      selector: '[data-test="shopping-cart-badge"]',
      description: 'Small numeric badge on the cart icon showing the item count',
    },
    this.healer,
  );

  async addBackpackToCart(): Promise<void> {
    await this.addBackpackToCartButton.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
