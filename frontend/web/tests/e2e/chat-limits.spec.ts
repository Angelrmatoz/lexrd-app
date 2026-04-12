import { test, expect, Page } from '@playwright/test';

const MAX_TURNS = 10;
const COUNTDOWN_SECONDS = 10;

async function waitForChatReady(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 15000 });
}

async function sendMessage(page: Page, text: string, expectedResponse: string) {
  const chatInput = page.getByPlaceholder('Consultar LexRD...');

  await expect(chatInput).toBeEnabled({ timeout: 15000 });
  await chatInput.fill(text);
  await page.keyboard.press('Enter');

  await expect(page.getByText(text, { exact: true })).toBeVisible({ timeout: 10000 });

  const thinking = page.getByText('Pensando...');
  await expect(thinking).toBeVisible({ timeout: 10000 });
  await expect(thinking).toBeHidden({ timeout: 10000 });

  await expect(page.locator('.text-\\[16px\\]').last()).toContainText(expectedResponse, {
    timeout: 10000,
  });
}

test.describe.serial('LexRD - Límites de conversación (Mocked)', () => {
  test.beforeEach(async ({ page }) => {
    let replyCount = 0;

    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route('**/api/chat', async (route) => {
      replyCount += 1;
      await page.waitForTimeout(150);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: `Respuesta ${replyCount}`,
          sources: [],
          sessionId: `mock-session-${replyCount}`,
        }),
      });
    });

    await waitForChatReady(page);
  });

  test('Debe bloquear el input cuando se alcanza el límite de mensajes', async ({ page }) => {
    for (let index = 1; index <= MAX_TURNS; index += 1) {
      await sendMessage(page, `Consulta ${index}`, `Respuesta ${index}`);
    }

    await expect(page.getByText('Límite de conversación alcanzado')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText(`Se ha excedido el límite de ${MAX_TURNS} mensajes.`, { exact: false }),
    ).toBeVisible();
    await expect(page.getByPlaceholder('Conversación bloqueada...')).toBeDisabled();
    await expect(page.getByRole('button').filter({ hasText: 'arrow_upward' })).toBeDisabled();
  });

  test('Debe limpiar el chat automáticamente cuando termina el countdown', async ({ page }) => {
    test.slow();

    for (let index = 1; index <= MAX_TURNS; index += 1) {
      await sendMessage(page, `Consulta ${index}`, `Respuesta ${index}`);
    }

    await expect(page.getByText('Límite de conversación alcanzado')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/\d+s\./)).toBeVisible();

    await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({
      timeout: (COUNTDOWN_SECONDS + 5) * 1000,
    });
    await expect(page.getByText('Consulta 10')).not.toBeVisible();
    await expect(page.getByPlaceholder('Consultar LexRD...')).toBeEnabled();
  });
});
