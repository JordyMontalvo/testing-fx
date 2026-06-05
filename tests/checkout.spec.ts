import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

const countryEmails: Record<string, string> = {
  'Mexico': 'fx_plugin_test_mx@yopmail.com',
  'USA': 'fx_plugin_test_usa@yopmail.com',
  'Spain': 'fx_plugin_test_esp1@yopmail.com',
  'Ecuador': 'fx_plugin_test_ec@yopmail.com',
  'Chile': 'fx_plugin_test_cl@yopmail.com',
  'Argentina': 'fx_plugin_test_ar@yopmail.com'
};

test.describe('Checkout Flow', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    const startTimestamp = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
    console.log(`\n[${startTimestamp}] 🚀 Iniciando test: "${testInfo.title}" para ${testInfo.project.name}`);

    // Capturar errores en la consola del navegador
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const time = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
        console.log(`[${time}] [Browser Console Error]: ${msg.text()}`);
      }
    });

    // Capturar peticiones de red fallidas (ej. APIs de Fuxion que devuelven 400 o 500)
    page.on('response', response => {
      if (response.status() >= 400) {
        const time = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
        console.log(`[${time}] [Network Error] ${response.status()}: ${response.url()}`);
      }
    });
  });
  test('Should handle checkout for unregistered user', async ({ page }, testInfo) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Agregar un producto al carrito.
    await homePage.goto();
    await homePage.addProductToCart();

    // 2. Ir a finalizar compra (checkout).
    await cartPage.gotoCheckout();

    // 3. Ingresar un correo electrónico (no registrado).
    const unregisteredEmail = `newuser_${Date.now()}@yopmail.com`;
    await checkoutPage.enterUnregisteredEmail(unregisteredEmail);

    // 5. Correo NO ESTÁ registrado: rellenar formulario de datos, continuar y verificar.
    const dynamicDni = Date.now().toString().slice(-9); // DNI dinámico para que no marque error de "ya registrado"
    const dynamicPhone = '5' + Date.now().toString().slice(-9); // Teléfono dinámico de 10 dígitos
    const postalCode = testInfo.project.name === 'Argentina' ? '1234' : '11000';
    await checkoutPage.fillRegistrationForm('John', 'Doe', dynamicPhone, dynamicDni, postalCode, 'CDMX', 'Reforma 222');

    // 6. Esperar a que se procese el registro y aparezca la pantalla final de pago
    await checkoutPage.waitForPaymentScreen();
    
    // Tomar captura de pantalla específica para el país y con fecha/hora
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: `screenshot-unregistered-${testInfo.project.name}-${timestampStr}.png`, fullPage: true });
  });

  test('Should handle checkout for registered user', async ({ page }, testInfo) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Agregar un producto al carrito.
    await homePage.goto();
    await homePage.addProductToCart();

    // 2. Ir a finalizar compra (checkout).
    await cartPage.gotoCheckout();

    // 3. Ingresar un correo electrónico (registrado) y obtener código de verificación interceptando la red.
    const registeredEmail = countryEmails[testInfo.project.name] || 'fx_plugin_test_mx@yopmail.com';
    const verificationCode = await checkoutPage.enterEmailAndGetCode(registeredEmail);

    // 4. Correo ESTÁ registrado: validar el código obtenido en el modal.
    await checkoutPage.handleVerificationModal(verificationCode);

    // 5. Esperar a que se cierre el modal, se carguen los datos y aparezca la pantalla final de pago
    await checkoutPage.waitForPaymentScreen();
    
    // Tomar captura de pantalla específica para el país y con fecha/hora
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: `screenshot-registered-${testInfo.project.name}-${timestampStr}.png`, fullPage: true });
  });

});
