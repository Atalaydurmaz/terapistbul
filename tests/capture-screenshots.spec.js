// @ts-check
// README için ekran görüntüleri alır — public/screenshots altına yazar
// Çalıştırma: npx playwright test capture-screenshots.spec.js --workers=1
const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const {
  loginAsAdmin, loginAsTherapist, loginAsClient, registerClient,
} = require('./helpers/auth.helpers.js');

const OUT = path.resolve(__dirname, '..', 'public', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

async function dismissBanner(page) {
  try {
    await page.evaluate(() => {
      localStorage.setItem('cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing: true }));
    });
  } catch {}
  const accept = page.locator('button', { hasText: 'Kabul Et' }).first();
  if (await accept.isVisible().catch(() => false)) {
    await accept.click().catch(() => {});
    await page.waitForTimeout(200);
  }
}

test.use({ viewport: { width: 1440, height: 900 } });

test.describe.serial('README screenshots', () => {
  test('01-homepage', async ({ page }) => {
    await page.goto('/');
    await dismissBanner(page);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, '01-homepage.png'), fullPage: false });
  });

  test('02-terapistler', async ({ page }) => {
    await page.goto('/terapistler');
    await dismissBanner(page);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, '02-terapistler.png'), fullPage: false });
  });

  test('03-terapist-detay', async ({ page }) => {
    await page.goto('/terapist/1');
    await dismissBanner(page);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, '03-terapist-detay.png'), fullPage: false });
  });

  test('04-ai-eslestirme', async ({ page }) => {
    await page.goto('/ai-eslestirme');
    await dismissBanner(page);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, '04-ai-eslestirme.png'), fullPage: false });
  });

  test('05-chatbot', async ({ page }) => {
    await page.goto('/');
    await dismissBanner(page);
    await page.waitForTimeout(1000);
    const btn = page.locator('button[aria-label="Psikoloji Asistanı"]');
    await btn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, '05-chatbot.png'), fullPage: false });
  });

  test('06-admin-dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, '06-admin-dashboard.png'), fullPage: false });
  });

  test('07-admin-randevular', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/randevular');
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, '07-admin-randevular.png'), fullPage: false });
  });

  test('08-terapist-panel', async ({ page }) => {
    await loginAsTherapist(page);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, '08-terapist-panel.png'), fullPage: false });
  });

  test('09-panel-randevular', async ({ page }) => {
    await loginAsTherapist(page);
    await page.goto('/panel/randevular');
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, '09-panel-randevular.png'), fullPage: false });
  });

  test('10-hesabim', async ({ page, request }) => {
    await registerClient(request);
    await loginAsClient(page);
    await page.goto('/hesabim');
    await dismissBanner(page);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, '10-hesabim.png'), fullPage: false });
  });
});
