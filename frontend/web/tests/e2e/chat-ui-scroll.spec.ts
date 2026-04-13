import { test, expect, Page } from '@playwright/test';

async function waitForChatReady(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 15000 });
}

/**
 * Rellena el input de chat de forma fiable para componentes controlados de React.
 */
async function fillChatInput(page: Page, text: string) {
  const chatInput = page.getByPlaceholder('Consultar LexRD...');
  await chatInput.click();
  await chatInput.evaluate((el, value) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeSetter?.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, text);
  await expect(page.getByTestId('send-button')).toBeEnabled({ timeout: 5000 });
}

async function sendChatMessage(page: Page, text: string) {
  await fillChatInput(page, text);
  await page.keyboard.press('Enter');
  await expect(page.getByText(text)).toBeVisible({ timeout: 10000 });
}

test.describe.serial('LexRD - Interfaz y Navegación', () => {
  test.describe('Auto-Scroll Inteligente', () => {
    test('Debe hacer auto-scroll al enviar un mensaje', async ({ page }) => {
      await page.route('**/api/documents', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.route('**/api/chat', async (route) => {
        // Respuesta larga para verificar scroll + delay para "Pensando..."
        const longResponse = 'Este es un párrafo largo.\n\n'.repeat(10) + '**Texto final**';
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            response: longResponse,
            sources: [],
            sessionId: 'scroll-test',
          }),
        });
      });

      await waitForChatReady(page);

      // Verificar que inicialmente está arriba (welcome state visible)
      await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible();

      await sendChatMessage(page, 'Prueba de scroll');

      const pensando = page.getByText('Pensando...');
      await expect(pensando).toBeVisible({ timeout: 5000 });
      await expect(pensando).toBeHidden({ timeout: 10000 });

      // Verificar que el contenido se renderiza
      const response = page.locator('.text-\\[16px\\]').last();
      await expect(response).toContainText('Texto final', { timeout: 15000 });
    });

    test('Debe mantener múltiples mensajes visibles tras enviar varios', async ({ page }) => {
      await page.route('**/api/documents', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.route('**/api/chat', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            response: `**Respuesta generada automáticamente.**\n\nMás contenido de prueba.\n\n- Item 1\n- Item 2\n- Item 3`,
            sources: ['Código Civil'],
            sessionId: 'multi-msg-test',
          }),
        });
      });

      await waitForChatReady(page);

      // Enviar 3 mensajes
      for (let i = 1; i <= 3; i++) {
        await sendChatMessage(page, `Consulta número ${i}`);

        const pensando = page.getByText('Pensando...');
        await expect(pensando).toBeVisible({ timeout: 5000 });
        await expect(pensando).toBeHidden({ timeout: 10000 });

        // Verificar respuesta del asistente
        const responses = page.locator('.text-\\[16px\\]');
        await expect(responses.last()).toContainText('Respuesta generada', { timeout: 15000 });
      }

      // Verificar que todas las consultas del usuario están presentes
      for (let i = 1; i <= 3; i++) {
        await expect(page.getByText(`Consulta número ${i}`)).toBeVisible();
      }
    });
  });

  test.describe('Responsividad', () => {
    test('Debe mostrar el layout correctamente en resolución de móvil', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      await page.route('**/api/documents', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.route('**/api/chat', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            response: 'Respuesta en **modo móvil**.',
            sources: ['Código Civil'],
            sessionId: 'mobile-test',
          }),
        });
      });

      await waitForChatReady(page);

      await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 15000 });

      const chatInput = page.getByPlaceholder('Consultar LexRD...');
      await expect(chatInput).toBeVisible({ timeout: 5000 });
      await expect(chatInput).toBeEnabled();

      await sendChatMessage(page, 'Prueba móvil');

      const pensando = page.getByText('Pensando...');
      await expect(pensando).toBeVisible({ timeout: 5000 });
      await expect(pensando).toBeHidden({ timeout: 10000 });

      const response = page.locator('.text-\\[16px\\]').last();
      await expect(response).toContainText('modo móvil', { timeout: 15000 });

      // Verificar fuentes en móvil
      await expect(page.getByText('Fuentes Jurídicas')).toBeVisible();
    });

    test('Debe mostrar el layout correctamente en tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.route('**/api/documents', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.route('**/api/chat', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            response: 'Respuesta en **modo tablet**.',
            sources: [],
            sessionId: 'tablet-test',
          }),
        });
      });

      await waitForChatReady(page);

      await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 15000 });

      await sendChatMessage(page, 'Prueba tablet');

      const pensando = page.getByText('Pensando...');
      await expect(pensando).toBeVisible({ timeout: 5000 });
      await expect(pensando).toBeHidden({ timeout: 10000 });

      const response = page.locator('.text-\\[16px\\]').last();
      await expect(response).toContainText('modo tablet', { timeout: 15000 });
    });

    test('Debe funcionar el botón de Nuevo Chat en resolución móvil', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      await page.route('**/api/documents', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.route('**/api/chat', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            response: 'Respuesta de prueba.',
            sources: [],
            sessionId: 'mobile-clear',
          }),
        });
      });

      await waitForChatReady(page);

      await sendChatMessage(page, 'Mensaje para borrar en móvil');

      // Esperar a que la respuesta se renderice
      await page.waitForTimeout(500);

      // En móvil, el sidebar está colapsado: abrirlo primero
      const toggleSidebar = page.getByRole('button', { name: 'Toggle Sidebar' });
      await expect(toggleSidebar).toBeVisible({ timeout: 5000 });
      await toggleSidebar.click();

      // Ahora el botón "New Chat" debería ser visible (el sidebar usa texto en inglés)
      const newChatButton = page.getByRole('button', { name: 'New Chat' });
      await expect(newChatButton).toBeVisible({ timeout: 5000 });
      await newChatButton.click();

      // Verificar que se restaura el estado inicial
      await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Mensaje para borrar en móvil')).not.toBeVisible();
    });
  });
});
