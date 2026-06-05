const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testmexico.sites.fuxion.com/producto/base-culinaria-amarilla-cliente-mx/');
  
  await page.waitForTimeout(5000);
  const html = await page.content();
  console.log('HTML size:', html.length);
  const locators = page.locator('button');
  const count = await locators.count();
  for (let i = 0; i < count; i++) {
     const htmlStr = await locators.nth(i).evaluate(node => node.outerHTML);
     console.log('Button:', htmlStr);
  }
  
  await browser.close();
})();
