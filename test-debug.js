const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testmexico.sites.fuxion.com/producto/base-culinaria-amarilla-cliente-mx/');
  
  await page.locator('button[name="add-to-cart"]').first().click();
  await page.goto('https://testmexico.sites.fuxion.com/finalizar-compra/');
  
  await page.waitForTimeout(3000); // let it load
  
  // try the registered email
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.fill('fx_plugin_test_mx@yopmail.com');
  await page.click('body');
  
  console.log('Waiting for network idle...');
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'debug-registered.png' });
  console.log('Screenshot saved to debug-registered.png');
  
  // print out all inputs to see what's required
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
      console.log('Input:', await input.getAttribute('name'), await input.getAttribute('placeholder'), await input.getAttribute('required'));
  }

  await browser.close();
})();
