const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://testargentinaa.sites.fuxion.com/tienda/');
  await page.locator('a[href*="/producto/"]').first().click();
  await page.waitForTimeout(3000);
  await page.locator('button[name="add-to-cart"]').first().click();
  await page.waitForTimeout(2000);
  await page.goto('https://testargentinaa.sites.fuxion.com/finalizar-compra/');
  
  await page.locator('input[type="email"]').first().fill(`test_${Date.now()}@yopmail.com`);
  await page.locator('input[type="email"]').first().press('Tab');
  await page.waitForTimeout(2000);
  
  await page.getByPlaceholder('Nombre').first().fill('John');
  await page.getByPlaceholder('Apellido').first().fill('Doe');
  await page.getByPlaceholder('Teléfono').first().fill('5512345678');
  await page.getByPlaceholder(/DNI|RUT|Cédula|Documento/i).first().fill('12345678');
  
  const postals = await page.getByPlaceholder('Código Postal').all();
  for (const p of postals) { try { await p.fill('1000', { force: true }); } catch (e) {} }

  const validateBtn = page.locator('button:has-text("Validar")').first();
  if (await validateBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await validateBtn.click({ force: true });
    await page.waitForTimeout(2000);
    const clickAquiBtn = page.locator('button:has-text("Click aquí")').first();
    if (await clickAquiBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await clickAquiBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }
  }

  const otherInputs = ['Barrio', 'Localidad', 'Colonia', 'Calle', 'Referencia', 'Número', 'Cédula', 'CUIT'];
  for (const ph of otherInputs) {
    try {
      await page.getByPlaceholder(new RegExp(ph, 'i')).first().fill('123', { timeout: 500, force: true });
    } catch (e) {}
  }

  const selects = await page.locator('select').all();
  for (const select of selects) {
    const id = await select.getAttribute('id') || '';
    if (id.includes('departamento') || id.includes('provincia') || id.includes('estado') || id.includes('ciudad') || id.includes('billing_state') || id.includes('condicion_impositiva') || id.includes('factura')) {
      try {
        await select.selectOption({ index: 1 }, { force: true, timeout: 500 });
      } catch (e) {}
    }
  }
  
  await page.locator('body').click();
  await page.waitForTimeout(3000);
  await page.locator('button#registrarse').first().click({ force: true });
  await page.waitForTimeout(5000);
  
  const errors = await page.locator('.woocommerce-error, .error, [style*="color: red"], [style*="color:red"], .invalid-feedback').allInnerTexts();
  console.log('Validation Errors:', errors);
  
  const isHidden = await page.locator('#place_order').isHidden();
  console.log('Is place_order hidden?', isHidden);
  
  const formText = await page.locator('form').first().innerText();
  console.log('Form Text:', formText.substring(0, 1000));

  await browser.close();
})();
