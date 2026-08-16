import { test, expect, config } from '@core/fixtures/test';
import { LoginPage } from '@pages/sauce-demo/LoginPage';
import { InventoryPage } from '@pages/sauce-demo/InventoryPage';
import { CartPage } from '@pages/sauce-demo/CartPage';

test.describe('SauceDemo — cart', () => {
  test('logs in, adds an item to the cart, and verifies it in the cart', async ({ page, pages }) => {
    const loginPage = pages.create(LoginPage);
    await loginPage.open();
    await loginPage.login(config.ui.username, config.ui.password);
    await expect(page).toHaveURL(/inventory\.html/);

    const inventoryPage = pages.create(InventoryPage);
    await inventoryPage.addBackpackToCart();
    await expect(inventoryPage.cartBadge.resolve()).toHaveText('1');

    await inventoryPage.openCart();
    await expect(page).toHaveURL(/cart\.html/);

    const cartPage = pages.create(CartPage);
    await expect(cartPage.firstItemName.resolve()).toHaveText('Sauce Labs Backpack');
  });
});
