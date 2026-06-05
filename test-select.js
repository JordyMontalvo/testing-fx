const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testmexico.sites.fuxion.com/producto/base-culinaria-amarilla-cliente-mx/');
  await page.locator('button[name="add-to-cart"]').first().click();
  await page.goto('https://testmexico.sites.fuxion.com/finalizar-compra/');
  await page.waitForTimeout(3000);
  
  const selects = await page.locator('select').all();
  for (const select of selects) {
      console.log('Select:', await select.getAttribute('name'), await select.getAttribute('id'));
      const options = await select.locator('option').allInnerTexts();
      console.log('Options:', options.slice(0, 3));
  }
  
  const errors = await page.locator('.woocommerce-error, .error').allInnerTexts();
  console.log('Errors on page:', errors);

  await browser.close();
})();
