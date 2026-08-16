import { test, config } from '@core/fixtures/test';
import { SauceDemoFlows } from '@flows/sauce-demo/SauceDemoFlows';
import { CheckoutInfoBuilder } from '@testdata/CheckoutInfoBuilder';

test.describe('SauceDemo — cart and checkout', () => {
  test('logs in, adds an item to the cart, verifies it, and checks out', async ({ page, pages }) => {
    const flows = new SauceDemoFlows(page, pages);
    const checkoutInfo = new CheckoutInfoBuilder().build();

    await flows.loginAsStandardUser(config.ui.username, config.ui.password);
    await flows.addBackpackToCart();
    await flows.verifyCartContains('Sauce Labs Backpack');
    await flows.fillCheckoutInfoAndContinue(checkoutInfo);
    await flows.finishOrder();
    await flows.verifyOrderConfirmed();
  });
});
