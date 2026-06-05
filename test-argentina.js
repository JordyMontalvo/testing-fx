const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testargentinaa.sites.fuxion.com/tienda/');
  
  const productLinks = page.locator('a[href*="/producto/"]');
  const count = await productLinks.count();
  if (count > 0) {
      await productLinks.first().click();
      await page.waitForTimeout(3000);
      await page.locator('button[name="add-to-cart"]').first().click();
      await page.waitForTimeout(2000);
      await page.goto('https://testargentinaa.sites.fuxion.com/finalizar-compra/');
      await page.waitForTimeout(4000);
      
      const buttons = await page.locator('button').allInnerTexts();
      console.log('Buttons:', buttons);
      
      const inputs = await page.locator('input').all();
      for (const i of inputs) {
          console.log('Input:', await i.getAttribute('placeholder'), await i.getAttribute('id'));
      }
  } else {
      console.log('No products found');
  }

  await browser.close();
})();
