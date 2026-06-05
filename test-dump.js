const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testmexico.sites.fuxion.com/tienda/');
  
  await page.waitForTimeout(5000);
  const locators = page.locator('a');
  const count = await locators.count();
  let productUrl = null;
  for (let i = 0; i < count; i++) {
     const href = await locators.nth(i).getAttribute('href');
     if (href && href.includes('/producto/')) {
         productUrl = href;
         break;
     }
  }
  console.log('Product URL:', productUrl);
  
  if (productUrl) {
      await page.goto(productUrl);
      await page.waitForTimeout(3000);
      const addToCart = page.locator('text=Agregar al carrito, text=Añadir al carrito').first();
      console.log('AddToCart button count:', await addToCart.count());
  }
  
  await browser.close();
})();
