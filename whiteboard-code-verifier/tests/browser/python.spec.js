import { boardFile, importBoard, openPanel } from './helpers.js';
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { selectWritingRegion } from './board-helpers.js';

async function pythonBoard(page) {
  await page.goto('/');
  await selectWritingRegion(page);
  await page.getByRole('radio', { name: 'Python', exact: true }).check();
  await openPanel(page);
}

test('right-panel language toggle runs actual Python and maps syntax and runtime errors', async ({ page }) => {
  await pythonBoard(page);
  const source = page.getByLabel(/CODE THAT RUNS/);
  await source.fill('from collections import deque\n\na, b = map(int, input().split())\nprint(sum(deque([a, b])))\n');
  await page.getByLabel('STANDARD INPUT · BLUE INK').fill('3 5\n');
  const sent = page.waitForRequest('**/api/run');
  await page.getByRole('button', { name: 'Verify & run', exact: true }).click();
  expect((await sent).postDataJSON().language).toBe('python');
  await expect(page.locator('.terminal pre')).toHaveText('8\n');
  await openPanel(page);
  await source.fill('\n\nif True\n    print(1)\n');
  await page.getByRole('button', { name: 'Verify & run', exact: true }).click();
  await expect(page.locator('.result-status')).toContainText('Check the syntax');
  await expect(page.locator('.diagnostic').first()).toContainText('L3');
  await expect(page.locator('.diagnostic').first()).toContainText('SyntaxError');
  await openPanel(page);
  await source.fill('\n\nprint(1 / 0)\n');
  await page.getByRole('button', { name: 'Verify & run', exact: true }).click();
  await expect(page.locator('.diagnostic').first()).toContainText('ZeroDivisionError');
  await expect(page.locator('.diagnostic').first()).toContainText('L3');
  await page.getByRole('radio', { name: 'C++', exact: true }).check();
  await expect(page.locator('.stale-notice')).toBeVisible();
});

test('Python cases run the selected language and download/import restores that language', async ({ page }, testInfo) => {
  await pythonBoard(page);
  const program = 'print(int(input()) * 2)\n';
  // The editor holds the code that runs; the board text is what a download keeps.
  await importBoard(page, boardFile({ code: program, language: 'python' }));
  await openPanel(page);
  await page.getByRole('tab', { name: 'Cases', exact: true }).click();
  await page.locator('#case-input-1').fill('5\n');
  await page.locator('.case-check input').first().check();
  await page.locator('#case-output-1').fill('10\n');
  await page.getByRole('button', { name: 'Run 1 case', exact: true }).click();
  await expect(page.locator('.case-results li.passed')).toHaveCount(1);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download', exact: true }).click();
  const file = await downloaded;
  const path = testInfo.outputPath('python.excalidraw');
  await file.saveAs(path);
  const data = JSON.parse(await readFile(path, 'utf8'));
  expect(data.verifier.language).toBe('python');
  await page.getByLabel('Demo lesson').selectOption('sum');
  await expect(page.getByRole('radio', { name: 'C++', exact: true })).toBeChecked();
  await page.locator('input[type=file][accept=".excalidraw,.json"]').setInputFiles(path);
  await expect(page.getByRole('radio', { name: 'Python', exact: true })).toBeChecked();
  await openPanel(page);
  await expect(page.getByLabel(/CODE THAT RUNS/)).toHaveValue(program);
});

test('Python OCR keeps indentation, requires confirmation and invalidates it on a language switch', async ({ page }) => {
  await page.route('**/api/health*', (route) => route.fulfill({ json: { runner: { available: true }, ocr: { available: true } } }));
  await page.route('**/api/ocr', (route) => {
    expect(route.request().postDataJSON().language).toBe('python');
    return route.fulfill({ json: { provider: 'test-fixture', model: 'fixture-only', durationMs: 1, language: 'python', requiresConfirmation: true,
      code: ['for x in range(2):', '    print(x)'].map((text, index) => ({ text, uncertain: false, alternatives: [], box: [10 + index * 300, 10, 200 + index * 300, 900] })), stdin: [] } });
  });
  await pythonBoard(page);
  const area = await page.locator('.canvas-container').boundingBox();
  await page.mouse.move(area.x + area.width * .4, area.y + area.height * .45);
  await page.mouse.down();
  await page.mouse.move(area.x + area.width * .4 + 30, area.y + area.height * .45 + 10, { steps: 5 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Read & review handwriting', exact: true }).click();
  await expect(page.getByLabel('Code line 2', { exact: true })).toHaveValue('    print(x)');
  await expect(page.getByRole('button', { name: 'Use confirmed code', exact: true })).toBeDisabled();
  await page.getByRole('checkbox', { name: 'I checked the code and input against the handwriting.' }).check();
  await page.getByRole('button', { name: 'Use confirmed code', exact: true }).click();
  await page.getByRole('button', { name: 'Verify & run', exact: true }).click();
  await expect(page.locator('.terminal pre')).toHaveText('0\n1\n');
  await expect(page.getByRole('radio', { name: 'C++', exact: true })).toBeEnabled();
  await page.getByRole('radio', { name: 'C++', exact: true }).check();
  await expect(page.getByRole('button', { name: 'Read & review handwriting', exact: true })).toBeEnabled();
});
