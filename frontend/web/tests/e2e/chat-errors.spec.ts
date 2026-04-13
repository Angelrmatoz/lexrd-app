import {test, expect, Page} from '@playwright/test';

async function waitForChatReady(page: Page) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page.getByText('Tu Asistente Legal Digital')).toBeVisible({timeout: 15000});
}

/**
 * Rellena el input de chat de forma fiable para componentes controlados de React.
 * Usa el setter nativo del DOM + dispatch de eventos 'input' y 'change'.
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
        el.dispatchEvent(new Event('input', {bubbles: true}));
        el.dispatchEvent(new Event('change', {bubbles: true}));
    }, text);
    await expect(page.getByTestId('send-button')).toBeEnabled({timeout: 5000});
}

async function sendChatMessage(page: Page, text: string) {
    await fillChatInput(page, text);
    await page.keyboard.press('Enter');
    // Esperar a que el mensaje del usuario aparezca en el feed
    await expect(page.getByText(text)).toBeVisible({timeout: 10000});
}

test.describe.serial('LexRD - Resiliencia y Errores del API', () => {
    test('Debe mostrar mensaje de error cuando el API responde con 500', async ({page}) => {
        await page.route('**/api/documents', async (route) => {
            await route.fulfill({status: 200, contentType: 'application/json', body: '[]'});
        });

        await page.route('**/api/chat', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({error: 'Internal Server Error'}),
            });
        });

        await waitForChatReady(page);

        await sendChatMessage(page, 'Consulta que fallará');

        const pensando = page.getByText('Pensando...');
        await expect(pensando).toBeVisible({timeout: 5000});
        await expect(pensando).toBeHidden({timeout: 10000});

        await expect(
            page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
        ).toBeVisible({timeout: 10000});
    });

    test('Debe mostrar mensaje de error cuando el API responde con 429 (rate limit)', async ({
                                                                                                 page,
                                                                                             }) => {
        await page.route('**/api/documents', async (route) => {
            await route.fulfill({status: 200, contentType: 'application/json', body: '[]'});
        });

        await page.route('**/api/chat', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            await route.fulfill({
                status: 429,
                contentType: 'application/json',
                body: JSON.stringify({error: 'Too Many Requests'}),
            });
        });

        await waitForChatReady(page);

        await sendChatMessage(page, 'Consulta con rate limit');

        const pensando = page.getByText('Pensando...');
        await expect(pensando).toBeVisible({timeout: 5000});
        await expect(pensando).toBeHidden({timeout: 10000});

        await expect(
            page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
        ).toBeVisible({timeout: 10000});
    });

    test('Debe recuperarse después de un error y enviar un nuevo mensaje exitosamente', async ({
                                                                                                   page,
                                                                                               }) => {
        let shouldFail = true;

        await page.route('**/api/documents', async (route) => {
            await route.fulfill({status: 200, contentType: 'application/json', body: '[]'});
        });

        await page.route('**/api/chat', async (route) => {
            if (shouldFail) {
                shouldFail = false;
                await new Promise((resolve) => setTimeout(resolve, 800));
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({error: 'Internal Server Error'}),
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
        await sendChatMessage(page, 'Mensaje que falla');

        const pensando = page.getByText('Pensando...');
        await expect(pensando).toBeVisible({timeout: 5000});
        await expect(pensando).toBeHidden({timeout: 10000});

        await expect(
            page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
        ).toBeVisible({timeout: 10000});

        // Segundo mensaje: éxito
        await sendChatMessage(page, 'Mensaje exitoso');

        await expect(pensando).toBeVisible({timeout: 5000});
        await expect(pensando).toBeHidden({timeout: 10000});

        const response = page.locator('.text-\\[16px\\]').last();
        await expect(response).toContainText('respuesta exitosa', {timeout: 15000});

        const boldText = response.locator('strong');
        await expect(boldText).toContainText('respuesta exitosa');
    });

    test('Debe mostrar mensaje de error cuando el API devuelve respuesta vacía', async ({
                                                                                            page,
                                                                                        }) => {
        await page.route('**/api/documents', async (route) => {
            await route.fulfill({status: 200, contentType: 'application/json', body: '[]'});
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

        await sendChatMessage(page, 'Consulta con respuesta vacía');

        await expect(
            page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
        ).toBeVisible({timeout: 10000});
    });

    test('Debe mostrar mensaje de error cuando el API devuelve JSON malformado', async ({
                                                                                            page,
                                                                                        }) => {
        await page.route('**/api/documents', async (route) => {
            await route.fulfill({status: 200, contentType: 'application/json', body: '[]'});
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

        await sendChatMessage(page, 'Consulta con JSON malformado');

        await expect(
            page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
        ).toBeVisible({timeout: 10000});
    });

    test('Debe mostrar mensaje de error cuando hay fallo de red', async ({page}) => {
        await page.route('**/api/documents', async (route) => {
            await route.fulfill({status: 200, contentType: 'application/json', body: '[]'});
        });

        // Simular fallo de red (abort)
        await page.route('**/api/chat', async (route) => {
            await route.abort('failed');
        });

        await waitForChatReady(page);

        await sendChatMessage(page, 'Consulta con fallo de red');

        await expect(
            page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
        ).toBeVisible({timeout: 15000});
    });
});
