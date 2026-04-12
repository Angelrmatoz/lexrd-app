import { test, expect } from '@playwright/test';

test.describe('LexRD - Flujo Principal de Chat (Mocked)', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Bloquear cualquier otra petición de API que pueda estar fallando
    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    // 2. Mock del Chat con una respuesta garantizada
    await page.route('**/api/chat', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: "El **Código Civil Dominicano** es la base legal.",
          sources: ["Código Civil"],
          sessionId: "mock-123"
        })
      });
    });

    // 3. Ir a la página y esperar a que sea interactiva
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Esperar a que la hidratación de React termine
  });

  test('Debe enviar mensaje y recibir respuesta', async ({ page }) => {
    // Esperar a que la página cargue el estado inicial
    const welcome = page.getByText('Tu Asistente Legal Digital');
    await expect(welcome).toBeVisible({ timeout: 15000 });

    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    
    // Escribir y enviar de la forma más estándar posible
    await chatInput.fill('Requisitos divorcio');
    await expect(page.locator('button:has-text("arrow_upward")')).toBeEnabled({ timeout: 10000 });
    await page.keyboard.press('Enter');

    // Verificar que el mensaje del usuario aparece en el feed
    await expect(page.getByText('Requisitos divorcio')).toBeVisible({ timeout: 10000 });

    // 1. Verificar estado de "Pensando..." antes de recibir la respuesta
    const pensando = page.getByText('Pensando...');
    await expect(pensando).toBeVisible();

    // 2. Verificar que el estado "Pensando..." desaparezca
    await expect(pensando).toBeHidden({ timeout: 10000 });

    // 3. Esperar a que el typewriter termine (buscamos la respuesta completa del mock)
    const response = page.locator('.text-\\[16px\\]').last();
    await expect(response).toContainText('Código Civil Dominicano', { timeout: 15000 });

    // 5. Verificar Markdown y Formato (renderizado de negritas)
    const boldText = response.locator('strong');
    await expect(boldText).toContainText('Código Civil Dominicano');

    // 4. Verificar que se renderizan las Fuentes Jurídicas (RAG)
    await expect(page.getByText('Fuentes Jurídicas')).toBeVisible();
    await expect(page.getByText('Código Civil', { exact: true })).toBeVisible();
  });

  test('Debe limpiar el chat', async ({ page }) => {
    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    
    await chatInput.fill('Mensaje para borrar');
    await expect(page.locator('button:has-text("arrow_upward")')).toBeEnabled({ timeout: 10000 });
    await page.keyboard.press('Enter');
    
    await expect(page.getByText('Mensaje para borrar')).toBeVisible();

    // Esperar a que empiece a escribir
    await page.waitForTimeout(1000);

    // Click en Nuevo Chat
    const newChatButton = page.getByRole('button', { name: 'Nuevo Chat' }).first();
    await newChatButton.click();

    // El feed de mensajes debe desaparecer y volver la bienvenida
    await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Mensaje para borrar')).not.toBeVisible();
  });
});
