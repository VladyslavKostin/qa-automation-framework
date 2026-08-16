import { test, expect, config } from '@core/fixtures/test';
import { LoginPage } from '@pages/sauce-demo/LoginPage';
import { InventoryPage } from '@pages/sauce-demo/InventoryPage';
import { CartPage } from '@pages/sauce-demo/CartPage';
import { CheckoutStepOnePage } from '@pages/sauce-demo/CheckoutStepOnePage';
import { CheckoutOverviewPage } from '@pages/sauce-demo/CheckoutOverviewPage';
import { CheckoutCompletePage } from '@pages/sauce-demo/CheckoutCompletePage';
import { CheckoutInfoBuilder } from '@testdata/CheckoutInfoBuilder';

test.describe('SauceDemo — cart and checkout', () => {
  test('logs in, adds an item to the cart, verifies it, and checks out', async ({ page, pages }) => {
    const loginPage = pages.create(LoginPage);
    const inventoryPage = pages.create(InventoryPage);
    const cartPage = pages.create(CartPage);
    const checkoutInfo = new CheckoutInfoBuilder().build();

    await test.step('Log in as a standard user', async () => {
      await loginPage.open();
      await loginPage.login(config.ui.username, config.ui.password);
      await expect(page).toHaveURL(/inventory\.html/);
    });

    await test.step('Add the backpack to the cart', async () => {
      await inventoryPage.addBackpackToCart();
      await expect(inventoryPage.cartBadge.resolve()).toHaveText('1');
    });

    await test.step('Verify the item is in the cart', async () => {
      await inventoryPage.openCart();
      await expect(page).toHaveURL(/cart\.html/);
      await expect(cartPage.firstItemName.resolve()).toHaveText('Sauce Labs Backpack');
    });

    await test.step('Fill in checkout information and continue', async () => {
      await cartPage.proceedToCheckout();
      const checkoutStepOnePage = pages.create(CheckoutStepOnePage);
      await checkoutStepOnePage.fillAndContinue(checkoutInfo);
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('Finish the order', async () => {
      const checkoutOverviewPage = pages.create(CheckoutOverviewPage);
      await checkoutOverviewPage.finish();
      await expect(page).toHaveURL(/checkout-complete\.html/);
    });

    await test.step('Verify the order confirmation', async () => {
      const checkoutCompletePage = pages.create(CheckoutCompletePage);
      await expect(checkoutCompletePage.completeHeader.resolve()).toHaveText('Thank you for your order!');
    });
  });
});
