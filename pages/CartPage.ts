import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoCheckout() {
    await this.page.goto('/finalizar-compra/');
  }
}
