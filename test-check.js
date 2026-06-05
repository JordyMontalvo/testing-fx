const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testmexico.sites.fuxion.com/producto/base-culinaria-amarilla-cliente-mx/');
  await page.locator('button[name="add-to-cart"]').first().click();
  await page.goto('https://testmexico.sites.fuxion.com/finalizar-compra/');
  
  await page.waitForTimeout(3000);
  
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  for (const cb of checkboxes) {
      console.log('Checkbox:', await cb.getAttribute('name'), await cb.getAttribute('id'));
      // try to find label
      const id = await cb.getAttribute('id');
      if (id) {
          const label = await page.locator(`label[for="${id}"]`).innerText().catch(()=>'');
          console.log('Label:', label);
      }
  }

  await browser.close();
})();
