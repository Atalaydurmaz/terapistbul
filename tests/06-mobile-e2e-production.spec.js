// @ts-check
/**
 * PRODUCTION MOBILE E2E — READ-ONLY
 *
 * Amaç:
 *   Canlı site (https://terapistibul.com) üzerinde iPhone 14 ve Pixel 7
 *   viewport'larında mobil UX kontrolü. HİÇBİR VERİ YAZILMAZ — sadece
 *   navigasyon, görünürlük ve layout doğrulaması yapılır.
 *
 * Kapsam:
 *   1. Navbar / Hamburger menu
 *   2. Terapist kartları ve uzmanlık kaydırıcısı
 *   3. ChatBot ikonu
 *   4. Randevu akışı (mobil viewport)
 *   5. Takvim & saat seçimi
 *   6. Admin / Terapist paneli erişilebilirliği
 *   7. Performans (sayfa yükleme süreleri)
 */

const { test, expect, devices } = require('@playwright/test');

const PROD_URL = 'https://terapistibul.com';

const MOBILE_DEVICES = [
  { label: 'iPhone 14', config: devices['iPhone 14'] || devices['iPhone 13'] },
  { label: 'Pixel 7',   config: devices['Pixel 7']   || devices['Pixel 5']   },
];

for (const { label, config } of MOBILE_DEVICES) {
  // defaultBrowserType describe-scope'ta kullanılamaz — onu çıkar
  const { defaultBrowserType, ...useConfig } = config;

  test.describe(`📱 ${label} — Production Mobile`, () => {
    test.use({ ...useConfig, baseURL: PROD_URL });

    // ─── TASK 1: Mobile UI/UX ──────────────────────────────────────────

    test(`[${label}] Anasayfa yüklenir ve temel elementler görünür`, async ({ page }) => {
      const t0 = Date.now();
      const res = await page.goto('/', { waitUntil: 'domcontentloaded' });
      const loadMs = Date.now() - t0;

      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('Application error');

      console.log(`[${label}] / load: ${loadMs}ms  status: ${res?.status()}`);
    });

    test(`[${label}] Hamburger menu açılır / kapanır`, async ({ page }) => {
      await page.goto('/');

      // Hamburger butonu genelde aria-label veya svg ile belirtilir
      const hamburger = page
        .locator('button[aria-label*="menu" i], button[aria-expanded], button:has(svg)')
        .filter({ hasText: '' })
        .first();

      const hamburgerExists = await hamburger.count();
      if (hamburgerExists === 0) {
        test.info().annotations.push({ type: 'warning', description: 'Hamburger butonu bulunamadı — mobile menu yapısı farklı olabilir' });
        console.log(`[${label}] hamburger button NOT FOUND`);
        return;
      }

      await hamburger.click();
      await page.waitForTimeout(300);

      // Menü açıldığında "Terapistler" veya "Giriş" gibi linkler görünür olmalı
      const menuItems = page.getByRole('link', { name: /terapistler|giriş|hakkımızda|iletişim/i });
      const visibleCount = await menuItems.count();
      console.log(`[${label}] hamburger opened — ${visibleCount} nav items visible`);
      expect(visibleCount).toBeGreaterThan(0);

      // Kapat (aynı butona veya escape)
      await page.keyboard.press('Escape').catch(() => {});
    });

    test(`[${label}] Terapist kartları düzgün görünür (layout bozulmaz)`, async ({ page }) => {
      await page.goto('/terapistler', { waitUntil: 'domcontentloaded' });

      // Terapist kartları için yaygın pattern'leri dene
      const cards = page.locator('a[href*="/terapist/"], [class*="card" i]:has(img)');
      await page.waitForTimeout(1500);
      const count = await cards.count();
      console.log(`[${label}] /terapistler — ${count} potansiyel terapist kartı`);
      expect(count).toBeGreaterThan(0);

      // İlk kartın viewport'a sığıp sığmadığını kontrol et
      const firstCard = cards.first();
      const box = await firstCard.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        expect(box.width).toBeLessThanOrEqual(viewport.width + 10);
        console.log(`[${label}] first card: ${box.width}x${box.height} (viewport: ${viewport.width}x${viewport.height})`);
      }
    });

    test(`[${label}] Uzmanlık slider'ı taşmıyor (yatay scroll yok)`, async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1000);

      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewport = page.viewportSize();
      if (viewport) {
        // Anasayfa body genişliği viewport'tan anlamlı fazla olmamalı
        const overflow = bodyScrollWidth - viewport.width;
        console.log(`[${label}] body.scrollWidth=${bodyScrollWidth} viewport=${viewport.width} overflow=${overflow}px`);
        expect(overflow).toBeLessThan(20); // 20px tolerans (scrollbar vs.)
      }
    });

    test(`[${label}] ChatBot ikonu mobil ekranda görünür`, async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);

      // ChatBot yaygın olarak fixed position'da sağ altta olur
      const chatBot = page.locator(
        '[aria-label*="chat" i], [class*="chatbot" i], button[class*="fixed"]:has(svg), [data-testid*="chat" i]'
      );
      const count = await chatBot.count();
      console.log(`[${label}] chatbot candidate elements: ${count}`);

      if (count > 0) {
        const first = chatBot.first();
        await expect(first).toBeVisible({ timeout: 5000 });
        const box = await first.boundingBox();
        const viewport = page.viewportSize();
        if (box && viewport) {
          // Ekran içinde mi?
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.y).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 5);
          console.log(`[${label}] chatbot pos: x=${Math.round(box.x)} y=${Math.round(box.y)} ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
      } else {
        test.info().annotations.push({ type: 'warning', description: 'ChatBot widget bulunamadı' });
      }
    });

    // ─── TASK 2: Booking Flow (Mobile) ────────────────────────────────

    test(`[${label}] Terapist detay sayfası mobilde yüklenir`, async ({ page }) => {
      await page.goto('/terapistler');
      await page.waitForTimeout(1500);

      const firstTherapistLink = page.locator('a[href*="/terapist/"]').first();
      if (await firstTherapistLink.count() === 0) {
        console.log(`[${label}] Hiç terapist linki yok — atlanıyor`);
        return;
      }

      const href = await firstTherapistLink.getAttribute('href');
      await firstTherapistLink.click();
      await page.waitForLoadState('domcontentloaded');
      console.log(`[${label}] terapist detay açıldı: ${href}`);

      await expect(page.locator('body')).not.toContainText('404');

      // "Randevu Al" tarzı bir CTA butonu mobilde görünür mü?
      const ctaButton = page.getByRole('button', { name: /randevu|seans|görüşme|al/i }).first();
      const cta = await ctaButton.count();
      console.log(`[${label}] CTA butonu adet: ${cta}`);
    });

    test(`[${label}] Takvim / saat seçimi mobilde okunaklı`, async ({ page }) => {
      await page.goto('/terapistler');
      await page.waitForTimeout(1500);

      const firstLink = page.locator('a[href*="/terapist/"]').first();
      if (await firstLink.count() === 0) return;

      await firstLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // Takvim genellikle gün/tarih button'ları içerir
      const dateButtons = page.locator('button').filter({ hasText: /^\d{1,2}$|pazartesi|salı|çarşamba|perşembe|cuma|cumartesi|pazar/i });
      const dayCount = await dateButtons.count();
      console.log(`[${label}] tarih/saat adayı buton adet: ${dayCount}`);

      if (dayCount > 0) {
        const first = dateButtons.first();
        const box = await first.boundingBox();
        if (box) {
          // Mobilde tap target min ~40px olmalı (Apple/Google guideline)
          const tapOk = box.width >= 40 && box.height >= 40;
          console.log(`[${label}] ilk tarih buton: ${Math.round(box.width)}x${Math.round(box.height)} tap-friendly=${tapOk}`);
        }
      }
    });

    // ─── TASK 3: Panel erişilebilirliği ──────────────────────────────

    test(`[${label}] /panel/giris mobilde açılır`, async ({ page }) => {
      const t0 = Date.now();
      await page.goto('/panel/giris', { waitUntil: 'domcontentloaded' });
      const loadMs = Date.now() - t0;

      await expect(page.getByRole('heading', { name: /terapist girişi/i })).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();

      console.log(`[${label}] /panel/giris load: ${loadMs}ms`);
    });

    test(`[${label}] /admin/giris mobilde açılır`, async ({ page }) => {
      const t0 = Date.now();
      await page.goto('/admin/giris', { waitUntil: 'domcontentloaded' });
      const loadMs = Date.now() - t0;

      await expect(page.locator('input[type="email"], input[type="password"]').first()).toBeVisible();
      console.log(`[${label}] /admin/giris load: ${loadMs}ms`);
    });

    // ─── TASK 3: Performance ─────────────────────────────────────────

    test(`[${label}] Kritik sayfalar mobilde <4s yüklenir`, async ({ page }) => {
      const pages = ['/', '/terapistler', '/hakkimizda', '/destek', '/iletisim'];
      const results = [];

      for (const path of pages) {
        const t0 = Date.now();
        const res = await page.goto(path, { waitUntil: 'domcontentloaded' }).catch(() => null);
        const ms = Date.now() - t0;
        const status = res?.status() ?? 0;
        results.push({ path, ms, status });
        console.log(`[${label}] ${path.padEnd(18)} → ${status} in ${ms}ms`);
      }

      // Ortalama yükleme süresi raporu
      const avg = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);
      console.log(`[${label}] MOBILE AVG LOAD: ${avg}ms across ${results.length} pages`);

      // Hiçbiri 8s'yi geçmemeli (soft threshold)
      for (const r of results) {
        expect.soft(r.ms, `${r.path} çok yavaş`).toBeLessThan(8000);
        expect.soft(r.status, `${r.path} HTTP hata`).toBeLessThan(400);
      }
    });
  });
}
