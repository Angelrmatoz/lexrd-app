import { test, expect } from '@playwright/test';

test.describe('LexRD - Markdown Renderer (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Bloquear llamadas a /api/documents
    await page.route('**/api/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    // Mock del Chat devolviendo Markdown complejo
    await page.route('**/api/chat', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: "Aquí tienes un análisis con **negrita** y *cursiva*.\n\nTambién una lista:\n- Elemento 1\n- Elemento 2\n\nY una tabla:\n| Ley | Descripción |\n|---|---|\n| 108-05 | Registro Inmobiliario |",
          sources: ["Constitución de la República"],
          sessionId: "mock-markdown"
        })
      });
    });

    // Ir a la página y esperar hidratación
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Debe renderizar formato Markdown complejo correctamente en la respuesta de la IA', async ({ page }) => {
    // Asegurarse de que el input está listo
    const chatInput = page.getByPlaceholder('Consultar LexRD...');
    
    // Escribir un mensaje y enviarlo
    await expect(async () => {
      await chatInput.fill('Muéstrame un ejemplo de formato markdown');
      // Esperamos que el botón no esté deshabilitado
      await expect(page.getByTestId('send-button')).not.toBeDisabled({ timeout: 1000 });
    }).toPass({ timeout: 15000 });
    
    await page.keyboard.press('Enter');

    // Verificar que el estado "Pensando..." desaparezca
    const pensando = page.getByText('Pensando...');
    await expect(pensando).toBeHidden({ timeout: 10000 });

    // Esperar a que la IA termine de escribir (cuando termina, muestra las fuentes)
    await expect(page.getByText('Fuentes Jurídicas')).toBeVisible({ timeout: 15000 });

    // Localizar el contenedor de la respuesta de la IA
    // Nos aseguramos de seleccionar la última respuesta (la recién enviada)
    const aiResponseContainer = page.locator('.text-\\[16px\\]').last();
    
    // 1. Verificar negrita (<strong>)
    const boldText = aiResponseContainer.locator('strong');
    await expect(boldText).toHaveText('negrita');

    // 2. Verificar cursiva (<em>)
    const italicText = aiResponseContainer.locator('em');
    await expect(italicText).toHaveText('cursiva');

    // 3. Verificar listas (<ul> y <li>)
    const listItems = aiResponseContainer.locator('ul > li');
    await expect(listItems).toHaveCount(2);
    await expect(listItems.nth(0)).toHaveText('Elemento 1');
    await expect(listItems.nth(1)).toHaveText('Elemento 2');

    // 4. Verificar tablas (<table>, <th> y <td>)
    const table = aiResponseContainer.locator('table');
    await expect(table).toBeVisible();
    
    const tableHeaders = table.locator('th');
    await expect(tableHeaders.nth(0)).toHaveText('Ley');
    await expect(tableHeaders.nth(1)).toHaveText('Descripción');

    const tableCells = table.locator('td');
    await expect(tableCells.nth(0)).toHaveText('108-05');
    await expect(tableCells.nth(1)).toHaveText('Registro Inmobiliario');
  });
});
