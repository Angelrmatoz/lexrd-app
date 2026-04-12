   import { test, expect, Page } from '@playwright/test';

async function waitForChatReady(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 15000 });
}

test.describe('LexRD - Resiliencia y Errores del API', () => {
  test('Debe mostrar mensaje de error cuando el API responde con 500', async ({ page }) => {
    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    // Simular error 500 en el endpoint de chat con delay para dar tiempo a React
    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await waitForChatReady(page);

    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    await expect(chatInput).toBeEnabled({ timeout: 15000 });
    await chatInput.fill('Consulta que fallará');
    await page.keyboard.press('Enter');

    // Verificar que el mensaje del usuario aparece
    await expect(page.getByText('Consulta que fallará')).toBeVisible({ timeout: 10000 });

    // Verificar que el estado "Pensando..." aparece y desaparece
    const pensando = page.getByText('Pensando...');
    await expect(pensando).toBeVisible({ timeout: 5000 });
    await expect(pensando).toBeHidden({ timeout: 10000 });

    // Verificar mensaje de error amigable
    await expect(
      page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('Debe mostrar mensaje de error cuando el API responde con 429 (rate limit)', async ({
    page,
  }) => {
    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Too Many Requests' }),
      });
    });

    await waitForChatReady(page);

    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    await expect(chatInput).toBeEnabled({ timeout: 15000 });
    await chatInput.fill('Consulta con rate limit');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Consulta con rate limit')).toBeVisible({ timeout: 10000 });

    const pensando = page.getByText('Pensando...');
    await expect(pensando).toBeVisible({ timeout: 5000 });
    await expect(pensando).toBeHidden({ timeout: 10000 });

    await expect(
      page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('Debe recuperarse después de un error y enviar un nuevo mensaje exitosamente', async ({
    page,
  }) => {
    let shouldFail = true;

    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route('**/api/chat', async (route) => {
      if (shouldFail) {
        shouldFail = false;
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            response: 'Esta es una **respuesta exitosa** después del error.',
            sources: ['Código Civil'],
            sessionId: 'recovery-session',
          }),
        });
      }
    });

    await waitForChatReady(page);

    // Primer mensaje: falla
    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    await expect(chatInput).toBeEnabled({ timeout: 15000 });
    await chatInput.fill('Mensaje que falla');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Mensaje que falla')).toBeVisible({ timeout: 10000 });

    const pensando = page.getByText('Pensando...');
    await expect(pensando).toBeVisible({ timeout: 5000 });
    await expect(pensando).toBeHidden({ timeout: 10000 });

    await expect(
      page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
    ).toBeVisible({ timeout: 10000 });

    // Segundo mensaje: éxito
    await expect(chatInput).toBeEnabled({ timeout: 5000 });
    await chatInput.fill('Mensaje exitoso');
    await page.keyboard.press('Enter');

    // Verificar "Pensando..." ANTES de verificar la respuesta
    await expect(pensando).toBeVisible({ timeout: 5000 });
    await expect(pensando).toBeHidden({ timeout: 10000 });

    await expect(page.getByText('Mensaje exitoso')).toBeVisible({ timeout: 10000 });

    const response = page.locator('.text-\\[16px\\]').last();
    await expect(response).toContainText('respuesta exitosa', { timeout: 15000 });

    // Verificar Markdown
    const boldText = response.locator('strong');
    await expect(boldText).toContainText('respuesta exitosa');
  });

  test('Debe mostrar mensaje de error cuando el API devuelve respuesta vacía', async ({
    page,
  }) => {
    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '',
      });
    });

    await waitForChatReady(page);

    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    await expect(chatInput).toBeEnabled({ timeout: 15000 });
    await chatInput.fill('Consulta con respuesta vacía');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Consulta con respuesta vacía')).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('Debe mostrar mensaje de error cuando el API devuelve JSON malformado', async ({
    page,
  }) => {
    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{ esto no es json valido }',
      });
    });

    await waitForChatReady(page);

    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    // Esperar a que React termine de hidratar (patrón toPass para WebKit)
    await expect(async () => {
      await chatInput.fill('Consulta con JSON malformado');
      await expect(page.locator('button:has-text("arrow_upward")')).toBeEnabled({ timeout: 1000 });
    }).toPass({ timeout: 15000 });
    await page.keyboard.press('Enter');

    await expect(page.getByText('Consulta con JSON malformado')).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('Debe mostrar mensaje de error cuando hay timeout de red', async ({ page }) => {
    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    // Usar 'failed' en lugar de 'timedout' para evitar timeout real en WebKit
    await page.route('**/api/chat', async (route) => {
      await route.abort('failed');
    });

    await waitForChatReady(page);

    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    // Esperar a que React termine de hidratar (patrón toPass para WebKit)
    await expect(async () => {
      await chatInput.fill('Consulta con timeout');
      await expect(page.locator('button:has-text("arrow_upward")')).toBeEnabled({ timeout: 1000 });
    }).toPass({ timeout: 15000 });
    await page.keyboard.press('Enter');

    await expect(page.getByText('Consulta con timeout')).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
    ).toBeVisible({ timeout: 15000 });
  });
});
