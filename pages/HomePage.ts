import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.locator('button[name="add-to-cart"]').first();
  }

  async goto() {
    // Vamos a la tienda principal del país actual
    await this.page.goto('/tienda/'); 
    await this.page.waitForTimeout(3000); // Esperar carga de productos

    // Buscamos dinámicamente cualquier enlace que lleve a un producto
    const productLinks = this.page.locator('a[href*="/producto/"]');
    const count = await productLinks.count();
    if (count === 0) throw new Error('No se encontraron productos en la tienda');

    // Navegamos al detalle del producto encontrado haciendo click (más seguro que goto)
    await productLinks.first().click();
  }

  async addProductToCart() {
    await this.addToCartButton.waitFor({ state: 'visible' });
    await this.addToCartButton.click();
    await this.page.waitForTimeout(2000); // Wait for cart animation/update
  }
}

