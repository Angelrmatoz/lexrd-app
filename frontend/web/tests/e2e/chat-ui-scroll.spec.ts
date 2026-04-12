import { test, expect, Page } from '@playwright/test';

const MAX_TURNS = 10;

async function waitForChatReady(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 15000 });
}

async function fillChatWithMessages(page: Page, count: number) {
  for (let i = 1; i <= count; i++) {
    await page.route('**/api/chat', async (route) => {
      // Generar respuesta larga para forzar scroll
      const longResponse = `**Respuesta ${i}**\n\n`.repeat(5);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: longResponse,
          sources: ['Código Civil'],
          sessionId: `scroll-session-${i}`,
        }),
      });
    });

    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    await expect(chatInput).toBeEnabled({ timeout: 15000 });
    await chatInput.fill(`Mensaje ${i}`);
    await page.keyboard.press('Enter');

    // Esperar respuesta
    await expect(page.getByText(`Mensaje ${i}`)).toBeVisible({ timeout: 10000 });

    const pensando = page.getByText('Pensando...');
    await expect(pensando).toBeVisible({ timeout: 5000 });
    await expect(pensando).toBeHidden({ timeout: 10000 });

    // Limpiar route para siguiente iteración
    await page.unroute('**/api/chat');
  }
}

test.describe('LexRD - Interfaz y Navegación', () => {
  test.describe('Auto-Scroll Inteligente', () => {
    test('Debe hacer auto-scroll al enviar un mensaje', async ({ page }) => {
      await page.route('**/api/documents', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.route('**/api/chat', async (route) => {
        // Respuesta larga para verificar scroll
        const longResponse = 'Este es un párrafo largo.\n\n'.repeat(10) + '**Texto final**';
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

      // Obtener el contenedor de scroll
      const scrollContainer = page.locator('main.flex-1');

      // Verificar que inicialmente está arriba (welcome state visible)
      await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible();

      const chatInput = page.getByPlaceholder('Consultar LexRD...');
      await chatInput.fill('Prueba de scroll');
      await page.keyboard.press('Enter');

      // Esperar respuesta
      await expect(page.getByText('Prueba de scroll')).toBeVisible({ timeout: 10000 });

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
        const chatInput = page.getByPlaceholder('Consultar LexRD...');
        await expect(chatInput).toBeEnabled({ timeout: 15000 });
        await chatInput.fill(`Consulta número ${i}`);
        await page.keyboard.press('Enter');

        await expect(page.getByText(`Consulta número ${i}`)).toBeVisible({ timeout: 10000 });

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
      // Simular viewport de móvil (iPhone 12)
      await page.setViewportSize({ width: 390, height: 844 });

      await page.route('**/api/documents', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.route('**/api/chat', async (route) => {
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

      // Verificar que el welcome state es visible en móvil
      await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 15000 });

      // Verificar que el input es visible y usable en móvil
      const chatInput = page.getByPlaceholder('Consultar LexRD...');
      await expect(chatInput).toBeVisible({ timeout: 5000 });
      await expect(chatInput).toBeEnabled();

      // Enviar mensaje
      await chatInput.fill('Prueba móvil');
      await page.keyboard.press('Enter');

      // Verificar respuesta
      await expect(page.getByText('Prueba móvil')).toBeVisible({ timeout: 10000 });

      const pensando = page.getByText('Pensando...');
      await expect(pensando).toBeVisible({ timeout: 5000 });
      await expect(pensando).toBeHidden({ timeout: 10000 });

      const response = page.locator('.text-\\[16px\\]').last();
      await expect(response).toContainText('modo móvil', { timeout: 15000 });

      // Verificar fuentes en móvil
      await expect(page.getByText('Fuentes Jurídicas')).toBeVisible();
    });

    test('Debe mostrar el layout correctamente en tablet', async ({ page }) => {
      // Simular viewport de tablet (iPad)
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.route('**/api/documents', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      });

      await page.route('**/api/chat', async (route) => {
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

      const chatInput = page.getByPlaceholder('Consultar LexRD...');
      await expect(chatInput).toBeVisible({ timeout: 5000 });

      await chatInput.fill('Prueba tablet');
      await page.keyboard.press('Enter');

      await expect(page.getByText('Prueba tablet')).toBeVisible({ timeout: 10000 });

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

      // Enviar mensaje
      const chatInput = page.getByPlaceholder('Consultar LexRD...');
      await chatInput.fill('Mensaje para borrar en móvil');
      await page.keyboard.press('Enter');

      await expect(page.getByText('Mensaje para borrar en móvil')).toBeVisible({ timeout: 10000 });

      // Esperar respuesta
      await page.waitForTimeout(1000);

      // Click en Nuevo Chat
      const newChatButton = page.getByRole('button', { name: 'Nuevo Chat' }).first();
      await newChatButton.click();

      // Verificar que se restaura el estado inicial
      await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Mensaje para borrar en móvil')).not.toBeVisible();
    });
  });
});
