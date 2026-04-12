# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-errors.spec.ts >> LexRD - Resiliencia y Errores del API >> Debe mostrar mensaje de error cuando hay timeout de red
- Location: tests\e2e\chat-errors.spec.ts:213:7

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator:  locator('button:has-text("arrow_upward")')
Expected: enabled
Received: disabled
Timeout:  1000ms

Call log:
  - Expect "toBeEnabled" with timeout 1000ms
  - waiting for locator('button:has-text("arrow_upward")')
    5 × locator resolved to <button disabled data-size="icon" data-slot="button" data-variant="default" class="group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:a…>…</button>
      - unexpected value "disabled"


Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e6]:
        - link "Lex R D" [ref=e8]:
          - /url: /
          - generic [ref=e9]: Lex
          - generic [ref=e10]:
            - generic [ref=e11]: R
            - generic [ref=e12]: D
        - generic [ref=e13]:
          - navigation [ref=e14]:
            - link "Chat" [ref=e15]:
              - /url: /
            - link "Documentos Oficiales" [ref=e16]:
              - /url: /documentos-oficiales
          - button "Nuevo Chat" [ref=e18]:
            - img [ref=e19]
            - generic [ref=e20]: Nuevo Chat
    - main [ref=e21]:
      - generic [ref=e23]:
        - generic [ref=e25]: gavel
        - generic [ref=e26]:
          - heading "Tu Asistente Legal Digital" [level=1] [ref=e27]
          - paragraph [ref=e28]: Análisis legal dominicano experto, inteligencia regulatoria y jurisprudencia al alcance de tu mano.
    - generic [ref=e32]:
      - textbox "Consultar LexRD..." [active] [ref=e33]: Consulta con timeout
      - generic [ref=e34]:
        - button "arrow_upward" [disabled]:
          - generic: arrow_upward
  - button "Open Next.js Dev Tools" [ref=e40] [cursor=pointer]:
    - img [ref=e41]
  - alert [ref=e46]
```

# Test source

```ts
  130 | 
  131 |     // Segundo mensaje: éxito
  132 |     await expect(chatInput).toBeEnabled({ timeout: 5000 });
  133 |     await chatInput.fill('Mensaje exitoso');
  134 |     await page.keyboard.press('Enter');
  135 | 
  136 |     // Verificar "Pensando..." ANTES de verificar la respuesta
  137 |     await expect(pensando).toBeVisible({ timeout: 5000 });
  138 |     await expect(pensando).toBeHidden({ timeout: 10000 });
  139 | 
  140 |     await expect(page.getByText('Mensaje exitoso')).toBeVisible({ timeout: 10000 });
  141 | 
  142 |     const response = page.locator('.text-\\[16px\\]').last();
  143 |     await expect(response).toContainText('respuesta exitosa', { timeout: 15000 });
  144 | 
  145 |     // Verificar Markdown
  146 |     const boldText = response.locator('strong');
  147 |     await expect(boldText).toContainText('respuesta exitosa');
  148 |   });
  149 | 
  150 |   test('Debe mostrar mensaje de error cuando el API devuelve respuesta vacía', async ({
  151 |     page,
  152 |   }) => {
  153 |     await page.route('**/api/documents', async (route) => {
  154 |       await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  155 |     });
  156 | 
  157 |     await page.route('**/api/chat', async (route) => {
  158 |       await new Promise((resolve) => setTimeout(resolve, 800));
  159 |       await route.fulfill({
  160 |         status: 200,
  161 |         contentType: 'application/json',
  162 |         body: '',
  163 |       });
  164 |     });
  165 | 
  166 |     await waitForChatReady(page);
  167 | 
  168 |     const chatInput = page.getByPlaceholder('Consultar LexRD...');
  169 |     await expect(chatInput).toBeEnabled({ timeout: 15000 });
  170 |     await chatInput.fill('Consulta con respuesta vacía');
  171 |     await page.keyboard.press('Enter');
  172 | 
  173 |     await expect(page.getByText('Consulta con respuesta vacía')).toBeVisible({ timeout: 10000 });
  174 | 
  175 |     await expect(
  176 |       page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
  177 |     ).toBeVisible({ timeout: 10000 });
  178 |   });
  179 | 
  180 |   test('Debe mostrar mensaje de error cuando el API devuelve JSON malformado', async ({
  181 |     page,
  182 |   }) => {
  183 |     await page.route('**/api/documents', async (route) => {
  184 |       await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  185 |     });
  186 | 
  187 |     await page.route('**/api/chat', async (route) => {
  188 |       await new Promise((resolve) => setTimeout(resolve, 800));
  189 |       await route.fulfill({
  190 |         status: 200,
  191 |         contentType: 'application/json',
  192 |         body: '{ esto no es json valido }',
  193 |       });
  194 |     });
  195 | 
  196 |     await waitForChatReady(page);
  197 | 
  198 |     const chatInput = page.getByPlaceholder('Consultar LexRD...');
  199 |     // Esperar a que React termine de hidratar (patrón toPass para WebKit)
  200 |     await expect(async () => {
  201 |       await chatInput.fill('Consulta con JSON malformado');
  202 |       await expect(page.locator('button:has-text("arrow_upward")')).toBeEnabled({ timeout: 1000 });
  203 |     }).toPass({ timeout: 15000 });
  204 |     await page.keyboard.press('Enter');
  205 | 
  206 |     await expect(page.getByText('Consulta con JSON malformado')).toBeVisible({ timeout: 10000 });
  207 | 
  208 |     await expect(
  209 |       page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
  210 |     ).toBeVisible({ timeout: 10000 });
  211 |   });
  212 | 
  213 |   test('Debe mostrar mensaje de error cuando hay timeout de red', async ({ page }) => {
  214 |     await page.route('**/api/documents', async (route) => {
  215 |       await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  216 |     });
  217 | 
  218 |     // Usar 'failed' en lugar de 'timedout' para evitar timeout real en WebKit
  219 |     await page.route('**/api/chat', async (route) => {
  220 |       await route.abort('failed');
  221 |     });
  222 | 
  223 |     await waitForChatReady(page);
  224 | 
  225 |     const chatInput = page.getByPlaceholder('Consultar LexRD...');
  226 |     // Esperar a que React termine de hidratar (patrón toPass para WebKit)
  227 |     await expect(async () => {
  228 |       await chatInput.fill('Consulta con timeout');
  229 |       await expect(page.locator('button:has-text("arrow_upward")')).toBeEnabled({ timeout: 1000 });
> 230 |     }).toPass({ timeout: 15000 });
      |        ^ Error: expect(locator).toBeEnabled() failed
  231 |     await page.keyboard.press('Enter');
  232 | 
  233 |     await expect(page.getByText('Consulta con timeout')).toBeVisible({ timeout: 10000 });
  234 | 
  235 |     await expect(
  236 |       page.getByText('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.'),
  237 |     ).toBeVisible({ timeout: 15000 });
  238 |   });
  239 | });
  240 | 
```