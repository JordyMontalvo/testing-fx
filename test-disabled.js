const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testmexico.sites.fuxion.com/producto/base-culinaria-amarilla-cliente-mx/');
  await page.locator('button[name="add-to-cart"]').first().click();
  await page.goto('https://testmexico.sites.fuxion.com/finalizar-compra/');
  
  await page.locator('input[type="email"]').first().fill(`test_${Date.now()}@yopmail.com`);
  await page.locator('input[type="email"]').first().press('Tab');
  await page.waitForTimeout(2000);
  
  await page.getByPlaceholder('Nombre').first().fill('John');
  await page.getByPlaceholder('Apellido').first().fill('Doe');
  await page.getByPlaceholder('Teléfono').first().fill('5512345678');
  await page.getByPlaceholder(/DNI|RUT|Cédula|Documento/i).first().fill('123456789');
  
  await page.getByPlaceholder('Código Postal').first().fill('11000', {force: true});
  await page.getByPlaceholder('Ciudad').first().fill('CDMX', {force: true});
  await page.getByPlaceholder('Calle y número').first().fill('Reforma 222', {force: true});
  
  const selects = await page.locator('select').all();
  for (const select of selects) {
      const id = await select.getAttribute('id') || '';
      if (id.includes('departamento') || id.includes('estado') || id.includes('ciudad') || id.includes('billing_state')) {
          try { await select.selectOption({ index: 1 }, { force: true, timeout: 500 }); } catch (e) {}
      }
  }
  
  await page.waitForTimeout(2000);
  const btn = page.locator('button#registrarse').first();
  console.log('Disabled attr:', await btn.getAttribute('disabled'));
  console.log('OuterHTML:', await btn.evaluate(node => node.outerHTML));

  await browser.close();
})();
