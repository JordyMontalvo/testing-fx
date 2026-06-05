import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  
  // Verification Modal
  readonly verificationCodeInput: Locator;
  readonly verifyButton: Locator;

  // Registration Form
  readonly nameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly dniInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cityInput: Locator;
  readonly streetInput: Locator;
  readonly continueRegistrationButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Selectors for email step
    this.emailInput = page.locator('input[type="email"]').first();

    // Selectors for Verification Modal
    this.verificationCodeInput = page.getByPlaceholder('Ingresa el código');
    this.verifyButton = page.locator('button:has-text("Confirmar")');

    // Selectors for Registration Form
    this.nameInput = page.getByPlaceholder('Nombre').first();
    this.lastNameInput = page.getByPlaceholder('Apellido').first();
    this.phoneInput = page.getByPlaceholder('Teléfono').first();
    this.dniInput = page.getByPlaceholder(/DNI|RUT|Cédula|Documento/i).first(); // Soporte multipaís para Documentos
    this.postalCodeInput = page.getByPlaceholder('Código Postal').first();
    this.cityInput = page.getByPlaceholder('Ciudad').first();
    this.streetInput = page.getByPlaceholder('Calle y número').first();

    this.continueRegistrationButton = page.locator('button#registrarse').first();
  }

  async enterUnregisteredEmail(email: string) {
    await this.emailInput.fill(email);
    // Presionamos Tab para asegurar que se dispare el evento onBlur de forma natural
    await this.emailInput.press('Tab');
    
    // Opcional: esperar un poco a que cargue el estado
    await this.page.waitForTimeout(1500);
  }

  async enterEmailAndGetCode(email: string): Promise<string> {
    await this.emailInput.fill(email);
    await this.emailInput.press('Tab'); // Trigger check

    // Wait for the first modal to appear
    const sendCodeButton = this.page.locator('button:has-text("Enviar código de verificación")');
    await sendCodeButton.waitFor({ state: 'visible' });

    // Interceptamos el request que envía el código al correo
    const requestPromise = this.page.waitForRequest(req => {
      if (!req.url().includes('admin-ajax.php')) return false;
      if (req.method() !== 'POST') return false;
      const postData = req.postData();
      if (!postData) return false;
      
      return postData.includes('fuxion_enviar_email') && 
             postData.includes('yopmail.com');
    });

    // Click to actually send the email
    await sendCodeButton.click();

    // Esperamos a que se dispare el request
    const request = await requestPromise;
    const postData = decodeURIComponent(request.postData() || '');

    // Extraemos el código del cuerpo (body) del correo en el request
    const codeMatch = postData.match(/<strong>(\d+)<\/strong>/);
    if (!codeMatch || !codeMatch[1]) {
      throw new Error(`No se pudo encontrar el código de verificación en el payload: ${postData}`);
    }

    return codeMatch[1];
  }

  async handleVerificationModal(code: string) {
    // Ingresamos el código en el modal y confirmamos
    await this.verificationCodeInput.fill(code);
    await this.verifyButton.click();
  }

  async checkAndThrowFormErrors() {
    // Escaneamos si la página mostró algún error de validación (cuadros rojos típicos de WooCommerce o Fuxion)
    const errorLocators = [
      '.woocommerce-error', 
      '.woocommerce-Message--error',
      '.invalid-feedback',
      '.error-message',
      'text="Este número ya está registrado"',
      'text="ya está registrado"'
    ];
    
    for (const selector of errorLocators) {
      const errorEl = this.page.locator(selector).first();
      if (await errorEl.isVisible({ timeout: 1000 }).catch(() => false)) {
        const errorText = await errorEl.innerText();
        throw new Error(`\n❌ ERROR DETECTADO EN EL FORMULARIO FUXION ❌\nEl sistema devolvió el siguiente mensaje:\n"${errorText.trim()}"\n`);
      }
    }
  }

  async fillRegistrationForm(name: string, lastName: string, phone: string, dni: string, postal: string, city: string, street: string) {
    await this.nameInput.fill(name);
    await this.lastNameInput.fill(lastName);
    await this.phoneInput.fill(phone);
    await this.dniInput.fill(dni);
    
    // 1. Llenamos Código Postal primero (vital para Fuxion Argentina y cálculo de envíos)
    const postals = await this.page.getByPlaceholder('Código Postal').all();
    for (const p of postals) { try { if (await p.isVisible() && await p.isEnabled()) await p.fill(postal); } catch (e) {} }

    // 2. Para Argentina: Botón "Validar" obligatorio después del código postal
    const validateBtn = this.page.locator('button:has-text("Validar")').first();
    if (await validateBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await validateBtn.click({ force: true });
      
      // Esperar activamente hasta que el dropdown de calles se pueble (Fuxion Argentina API)
      // Buscamos un select que tenga más de 1 opción y que la primera diga "Elige la calle"
      await this.page.waitForFunction(() => {
          const selects = Array.from(document.querySelectorAll('select'));
          for (const s of selects) {
              if (s.options.length > 1 && s.options[0].text.toLowerCase().includes('elige la calle')) {
                  return true;
              }
          }
          return false;
      }, { timeout: 15000 }).catch(() => {
          console.log("No se pudo cargar el dropdown de calles a tiempo o no es Argentina.");
      });
      // Un pequeño extra para permitir que el DOM se asiente
      await this.page.waitForTimeout(1000);
    }

    const cities = await this.page.getByPlaceholder('Ciudad').all();
    for (const c of cities) { try { if (await c.isVisible() && await c.isEnabled()) await c.fill(city); } catch (e) {} }

    const streets = await this.page.getByPlaceholder('Calle y número').all();
    for (const s of streets) { try { if (await s.isVisible() && await s.isEnabled()) await s.fill(street); } catch (e) {} }
    
    // 3. Auto-completamos TODOS los dropdowns obligatorios usando JavaScript nativo
    // Esto es instantáneo y evita los timeouts masivos causados por interceptores de Select2
    await this.page.evaluate(() => {
        const selects = document.querySelectorAll('select');
        selects.forEach(s => {
            // Ignorar dropdowns de código de país de teléfono y selects deshabilitados
            if (s.disabled || (s.textContent && (s.textContent.includes('+54') || s.textContent.includes('+55') || s.textContent.includes('+1')))) {
                return;
            }
            
            // Si el select tiene más de una opción y está en el placeholder (index 0)
            if (s.options.length > 1 && (s.selectedIndex === 0 || !s.value)) {
                s.selectedIndex = 1;
                s.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Si la página usa jQuery (Select2), disparamos el evento de jQuery
                if (typeof (window as any).jQuery !== 'undefined') {
                    (window as any).jQuery(s).trigger('change');
                }
            }
        });
    });

    // Si hay un botón "Click aquí" para cargar la calle, presionarlo DESPUÉS de haber seleccionado la calle en el dropdown
    const clickAquiBtn = this.page.locator('button:has-text("Click aquí")').first();
    if (await clickAquiBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await clickAquiBtn.click({ force: true });
      await this.page.waitForTimeout(2000); // Esperar a que se limpie/active el campo "Número" y "Referencia"
    }

    // Completar otros posibles campos obligatorios (Barrio, Calle, Número, CUIT, etc)
    // Completar otros posibles campos obligatorios (Barrio, Calle, Número, CUIT, etc)
    const otherInputs = ['Barrio', 'Localidad', 'Colonia', 'Referencia', 'Número', 'Cédula', 'CUIT'];
    for (const ph of otherInputs) {
      try {
        let filled = false;
        // Buscamos primero por nombre accesible (Label/Aria-label)
        const roleLocators = await this.page.getByRole('textbox', { name: new RegExp(ph, 'i') }).all();
        for (const el of roleLocators) {
            if (await el.isVisible()) {
                await el.fill('123', { force: true });
                await el.blur(); // Disparamos validación de Fuxion
                filled = true;
                break; // Solo llenamos el primero visible
            }
        }
        
        // Fallback a placeholder si no se encontró por Role
        if (!filled) {
            const placeholders = await this.page.getByPlaceholder(new RegExp(ph, 'i')).all();
            for (const el of placeholders) {
                if (await el.isVisible()) {
                    await el.fill('123', { force: true });
                    await el.blur();
                    break;
                }
            }
        }
      } catch (e) {
          console.error(`Error llenando campo ${ph}: `, e);
      }
    }
    
    // Disparamos la validación quitando el foco
    await this.page.locator('body').click();
    
    // En WooCommerce a veces al llenar el código postal y la ciudad hace recálculo de envío. Esperamos para que el botón se habilite
    await this.page.waitForTimeout(3000);
    
    // Esperamos a que el botón esté habilitado y visible, no usamos force para asegurarnos de que el navegador lo acepte
    await this.continueRegistrationButton.scrollIntoViewIfNeeded();
    await this.continueRegistrationButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.continueRegistrationButton.click();

    // Revisamos si Fuxion nos bloqueó con algún error de validación
    await this.checkAndThrowFormErrors();
  }

  async waitForPaymentScreen() {
    // Revisamos nuevamente por si apareció algún error tardío
    await this.checkAndThrowFormErrors();
    // El ID estándar de WooCommerce para el botón de Pagar/Realizar Pedido es #place_order
    const placeOrderButton = this.page.locator('#place_order');
    
    // Esperamos a que esté visible (lo que indica que pasamos el registro/login y estamos en el paso final)
    await placeOrderButton.waitFor({ state: 'visible', timeout: 25000 });
    
    // Hacemos scroll hacia abajo para que el botón y el resumen de la orden salgan en el video
    await placeOrderButton.scrollIntoViewIfNeeded();
    
    // Esperamos a que se terminen de actualizar los métodos de envío y la pasarela de pago
    await this.page.waitForTimeout(5000);
  }
}

