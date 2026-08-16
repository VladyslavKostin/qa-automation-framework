import type { Page } from '@playwright/test';
import { test, expect } from '@core/fixtures/test';
import type { PageObjectFactory } from '@core/pages/PageObjectFactory';
import { LoginPage } from '@pages/sauce-demo/LoginPage';
import { InventoryPage } from '@pages/sauce-demo/InventoryPage';
import { CartPage } from '@pages/sauce-demo/CartPage';
import { CheckoutStepOnePage } from '@pages/sauce-demo/CheckoutStepOnePage';
import { CheckoutOverviewPage } from '@pages/sauce-demo/CheckoutOverviewPage';
import { CheckoutCompletePage } from '@pages/sauce-demo/CheckoutCompletePage';
import type { CheckoutInfo } from '@entities/CheckoutInfo';

/**
 * Reusable action steps for the SauceDemo user journey, each wrapped in its own `test.step()` so
 * every spec that composes them gets the same readable breakdown in the Allure/Playwright report
 * — without re-typing the step body. Any new spec (e.g. "remove an item from the cart") can reuse
 * `loginAsStandardUser` + `addBackpackToCart` without duplicating either.
 */
export class SauceDemoFlows {
  constructor(
    private readonly page: Page,
    private readonly pages: PageObjectFactory,
  ) {}

  async loginAsStandardUser(username: string, password: string): Promise<void> {
    await test.step('Log in as a standard user', async () => {
      const loginPage = this.pages.create(LoginPage);
      await loginPage.open();
      await loginPage.login(username, password);
      await expect(this.page).toHaveURL(/inventory\.html/);
    });
  }

  async addBackpackToCart(): Promise<void> {
    await test.step('Add the backpack to the cart', async () => {
      const inventoryPage = this.pages.create(InventoryPage);
      await inventoryPage.addBackpackToCart();
      await expect(inventoryPage.cartBadge.resolve()).toHaveText('1');
    });
  }

  async verifyCartContains(itemName: string): Promise<void> {
    await test.step('Verify the item is in the cart', async () => {
      const inventoryPage = this.pages.create(InventoryPage);
      await inventoryPage.openCart();
      await expect(this.page).toHaveURL(/cart\.html/);
      const cartPage = this.pages.create(CartPage);
      await expect(cartPage.firstItemName.resolve()).toHaveText(itemName);
    });
  }

  async fillCheckoutInfoAndContinue(info: CheckoutInfo): Promise<void> {
    await test.step('Fill in checkout information and continue', async () => {
      const cartPage = this.pages.create(CartPage);
      await cartPage.proceedToCheckout();
      const checkoutStepOnePage = this.pages.create(CheckoutStepOnePage);
      await checkoutStepOnePage.fillAndContinue(info);
      await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    });
  }

  async finishOrder(): Promise<void> {
    await test.step('Finish the order', async () => {
      const checkoutOverviewPage = this.pages.create(CheckoutOverviewPage);
      await checkoutOverviewPage.finish();
      await expect(this.page).toHaveURL(/checkout-complete\.html/);
    });
  }

  async verifyOrderConfirmed(): Promise<void> {
    await test.step('Verify the order confirmation', async () => {
      const checkoutCompletePage = this.pages.create(CheckoutCompletePage);
      await expect(checkoutCompletePage.completeHeader.resolve()).toHaveText('Thank you for your order!');
    });
  }
}
