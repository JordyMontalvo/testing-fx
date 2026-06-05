const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testmexico.sites.fuxion.com/');
  const addToCart = page.locator('.add_to_cart_button').first();
  console.log('AddToCart:', await addToCart.count() > 0 ? await addToCart.getAttribute('class') : 'NOT FOUND');
  
  await page.goto('https://testmexico.sites.fuxion.com/carrito/');
  const checkoutBtn = page.locator('.checkout-button').first();
  console.log('Checkout:', await checkoutBtn.count() > 0 ? await checkoutBtn.getAttribute('class') : 'NOT FOUND');
  await browser.close();
})();
