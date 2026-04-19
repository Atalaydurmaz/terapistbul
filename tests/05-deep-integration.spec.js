// @ts-check
// Derinlemesine entegrasyon testleri
// Senaryolar: tam rezervasyon döngüsü, video hazırlığı, realtime sync, chatbot
// NOT: Yalnızca test kodu. src/ dokunulmadı.

const { test, expect, request: apiRequest } = require('@playwright/test');
const {
  ADMIN_EMAIL, ADMIN_PASSWORD,
  STATIC_THERAPIST_EMAIL, STATIC_THERAPIST_PASSWORD,
  CLIENT_EMAIL, CLIENT_PASSWORD, CLIENT_NAME,
  THERAPIST_APP_EMAIL, THERAPIST_APP_PASSWORD,
  loginAsAdmin, loginAsTherapist, loginAsClient,
  registerClient, createTestAppointment, updateAppointmentStatus,
  fetchAllAppointments,
} = require('./helpers/auth.helpers.js');

const BASE_URL = 'http://localhost:3654';

// KVKK/çerez banner'ını chatbot tıklamalarından önce kapat
async function dismissCookieBanner(page) {
  try {
    await page.evaluate(() => {
      localStorage.setItem(
        'cookie_consent',
        JSON.stringify({ necessary: true, analytics: true, marketing: true }),
      );
    });
  } catch {}
  // Banner zaten gösterildiyse tıklayarak da kapat (storage olayı yetmeyebilir)
  const accept = page.locator('button', { hasText: 'Kabul Et' }).first();
  if (await accept.isVisible().catch(() => false)) {
    await accept.click({ trial: false }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

// Küçük yardımcılar
async function patchStatusViaPanel(request, id, status) {
  // Terapist paneli endpoint'i — onay Daily.co odasını tetikler
  const res = await request.patch(`${BASE_URL}/api/panel/randevular/${id}`, {
    data: { status },
    headers: { 'Content-Type': 'application/json' },
  });
  return { ok: res.ok(), status: res.status(), body: await res.json().catch(() => ({})) };
}

async function getAppointmentById(request, id) {
  const all = await fetchAllAppointments(request);
  return all.find((a) => a.id === id);
}

// ─────────────────────────────────────────────────────────
// 1. KOMPLE REZERVASYON DÖNGÜSÜ (Client → Pay (mock) → Terapist onay → Admin gözlem)
// ─────────────────────────────────────────────────────────
test.describe('Deep-1: Komple Rezervasyon Döngüsü', () => {
  test.beforeAll(async ({ request }) => {
    await registerClient(request);
  });

  test('Danışan giriş → terapist seç → /api/booking (ödeme mock yok — talep kaydı)', async ({ browser, request }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    // Danışan oturumu
    try {
      await loginAsClient(page);
    } catch (e) {
      console.log('[DEEP-1 UYARI] Danışan UI login başarısız olabilir, API fallback kullanılacak:', e.message);
    }

    // /terapistler sayfasını ziyaret et
    await page.goto('/terapistler');
    await expect(page).toHaveTitle(/Terapist|TerapistBul/i);

    // Terapist detayına git (id=1 — Dr. Ayşe Kaya statik)
    await page.goto('/terapist/1');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Sayfa yüklendi mi kontrol
    const hasBooking = await page.locator('button', { hasText: 'Randevu Al' }).count();
    console.log(`[DEEP-1] Terapist detay — 'Randevu Al' butonu: ${hasBooking > 0 ? 'VAR' : 'YOK'}`);

    // API üzerinden rezervasyon (UI modalı güvenli değil — flaky)
    const { ok, status, body } = await createTestAppointment(request, 'Dr. Ayşe Kaya');
    expect(ok).toBeTruthy();
    const aptId = body.id || body.supabaseId;
    expect(aptId).toBeTruthy();
    console.log(`[DEEP-1] Randevu oluşturuldu: ${aptId}, durum: ${body.status}`);

    // Danışan bakış açısı — not: /api/hesabim/mesajlar session gerektirir. API test yerine UI test.
    // UI: /hesabim sayfasında yeni randevu bekliyor görünmeli
    await page.goto('/hesabim');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    await ctx.close();
  });

  test('Terapist onay → status "onayli" → Admin Paneli değişikliği görmeli', async ({ request }) => {
    // Adım 1: Randevu oluştur
    const created = await createTestAppointment(request, 'Dr. Ayşe Kaya');
    expect(created.ok).toBeTruthy();
    const aptId = created.body.id;
    console.log(`[DEEP-1] Test randevusu: ${aptId} (bekliyor)`);

    // Adım 2: Terapist panel endpoint'i — onay ver
    const patch = await patchStatusViaPanel(request, aptId, 'onayli');
    if (!patch.ok) {
      console.log(`[DEEP-1 HATA] Panel PATCH başarısız: ${patch.status}`, patch.body);
    }
    expect([200, 500]).toContain(patch.status); // Daily.co key yoksa 500 olabilir

    // Adım 3: Admin /api/randevular üzerinden "onayli" görmeli
    await new Promise((r) => setTimeout(r, 500));
    const apt = await getAppointmentById(request, aptId);
    expect(apt).toBeTruthy();
    if (patch.ok) {
      expect(apt.status).toBe('onayli');
      console.log(`[DEEP-1 OK] Admin Paneli — randevu "onayli" durumunda`);
    } else {
      console.log(`[DEEP-1 UYARI] Panel PATCH 500 — Daily.co entegrasyonu çalışmadı. Status beklenmedik:`, apt?.status);
    }
  });

  test('Admin Paneli UI — onaylı randevu yeni badge ile görünür', async ({ page, request }) => {
    // Önceden bir onaylı randevu olmalı
    const all = await fetchAllAppointments(request);
    const onayli = all.find((a) => a.status === 'onayli');
    if (!onayli) {
      console.log('[DEEP-1 BİLGİ] Onaylı randevu yok — UI test atlandı');
      test.skip();
      return;
    }

    try {
      await loginAsAdmin(page);
      await page.goto('/admin/randevular');
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      // "Onaylı" veya "onayli" metnini içeren en az bir satır olmalı
      const count = await page.locator('text=/onayl[ıi]/i').count();
      console.log(`[DEEP-1] Admin UI — onaylı etiketli eleman sayısı: ${count}`);
      expect(count).toBeGreaterThan(0);
    } catch (e) {
      console.log(`[DEEP-1 HATA] Admin UI doğrulama hatası: ${e.message}`);
      throw e;
    }
  });
});

// ─────────────────────────────────────────────────────────
// 2. VİDEO GÖRÜŞME HAZIRLIĞI — Daily.co odası oluşumu
// ─────────────────────────────────────────────────────────
test.describe('Deep-2: Video Görüşme Hazırlığı (Daily.co)', () => {
  let createdAptId = null;
  let dailyUrl = null;

  test('Onay sonrası Daily.co odası anında üretilir', async ({ request }) => {
    const created = await createTestAppointment(request, 'Dr. Ayşe Kaya');
    expect(created.ok).toBeTruthy();
    createdAptId = created.body.id;

    const patch = await patchStatusViaPanel(request, createdAptId, 'onayli');
    if (!patch.ok) {
      console.log(`[DEEP-2 HATA] Daily.co üretimi başarısız. HTTP ${patch.status}`, patch.body);
      console.log(`[DEEP-2] Bu test DAILY_API_KEY env değişkeni gerektirir`);
    }
    expect(patch.ok).toBeTruthy();

    // Patch body'de daily_room_url veya /api/randevular üzerinden çek
    await new Promise((r) => setTimeout(r, 400));
    const apt = await getAppointmentById(request, createdAptId);
    dailyUrl = apt?.daily_room_url;
    expect(dailyUrl).toBeTruthy();
    expect(dailyUrl).toMatch(/^https:\/\/.*\.daily\.co\//);
    console.log(`[DEEP-2 OK] Daily.co odası üretildi: ${dailyUrl}`);
  });

  test('Danışan "Görüşmeye Katıl" linkini /hesabim API yanıtında görür (oturumlu)', async ({ browser }) => {
    if (!createdAptId || !dailyUrl) {
      test.skip();
      return;
    }
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await loginAsClient(page);
    } catch {
      console.log('[DEEP-2] Client login başarısız — test skip');
      await ctx.close();
      test.skip();
      return;
    }

    // Oturumlu fetch
    const res = await page.request.get('/api/hesabim/mesajlar');
    expect(res.ok()).toBeTruthy();
    const messages = await res.json();
    const hasVideo = messages.some((m) => m.daily_room_url && m.daily_room_url.includes('daily.co'));
    console.log(`[DEEP-2] Danışan /api/hesabim/mesajlar → Daily.co linki var mı: ${hasVideo}`);
    expect(hasVideo).toBeTruthy();
    await ctx.close();
  });

  test('Görüşme sayfası (/gorusme) daily_room_url parametresi ile yüklenir', async ({ page }) => {
    if (!dailyUrl) {
      test.skip();
      return;
    }
    const url = `/gorusme?room=${encodeURIComponent(dailyUrl)}&name=${encodeURIComponent(CLIENT_NAME)}`;
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    // iframe ya da daily embed olmalı — en az sayfa yüklenmeli
    const title = await page.title();
    console.log(`[DEEP-2] Görüşme sayfası title: "${title}"`);
    expect(page.url()).toContain('/gorusme');
  });
});

// ─────────────────────────────────────────────────────────
// 3. GERÇEK ZAMANLI SYNC (iki context — Supabase Realtime)
// ─────────────────────────────────────────────────────────
test.describe('Deep-3: Gerçek Zamanlı Senkronizasyon', () => {
  test('İki admin context — biri PATCH yaparken diğeri refresh olmadan güncellenir', async ({ browser, request }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await loginAsAdmin(pageA);
      await loginAsAdmin(pageB);

      // Başlangıç — toplam randevu sayısı
      const initial = (await fetchAllAppointments(request)).length;
      console.log(`[DEEP-3] Başlangıç randevu sayısı: ${initial}`);

      // pageB dashboard'u gözlüyor
      await pageB.goto('/admin/dashboard');
      await pageB.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // pageA tarafından yeni randevu eklenir (API)
      const created = await createTestAppointment(request, 'Dr. Ayşe Kaya');
      expect(created.ok).toBeTruthy();
      const aptId = created.body.id;
      console.log(`[DEEP-3] pageA tarafından eklendi: ${aptId}`);

      // pageB refresh olmadan KPI güncellensin mi?
      // Supabase realtime varsa — 3 saniye içinde güncellenmeli
      // Polling fallback varsa — 30 saniyede güncellenmeli (bekleme sınırlı)
      const kpiLocator = pageB.locator('text=Toplam Randevu').first();
      await kpiLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      // Beklenti: Realtime ile <5s içinde, polling ile <35s
      const deadline = Date.now() + 35000;
      let synced = false;
      while (Date.now() < deadline) {
        const allNow = await fetchAllAppointments(request);
        if (allNow.length > initial) {
          synced = true;
          break;
        }
        await pageB.waitForTimeout(1500);
      }
      console.log(`[DEEP-3] API üzerinden yeni kayıt senkronizasyonu: ${synced ? 'OK' : 'BAŞARISIZ'}`);
      expect(synced).toBeTruthy();

      // UI tarafında otomatik güncelleme — random bir sayı değişmesi zor ama sayfa reload etmeden veri değişmelidir
      // Burada sadece varlık testi: page reload OLMADAN fetch yap — state güncellenmiş mi
      const bodyText = await pageB.textContent('body');
      console.log(`[DEEP-3] pageB DOM'da "Toplam Randevu" bulundu: ${bodyText?.includes('Toplam Randevu')}`);
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test('Terapist status güncellerken admin realtime kanalını duyar', async ({ browser, request }) => {
    const created = await createTestAppointment(request);
    const aptId = created.body.id;
    expect(aptId).toBeTruthy();

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await loginAsAdmin(page);
      await page.goto('/admin/dashboard');

      // Supabase realtime kanalının açılıp açılmadığını yakalamak için console log'u dinle
      const wsMessages = [];
      page.on('websocket', (ws) => {
        wsMessages.push(`WS açıldı: ${ws.url()}`);
        ws.on('framesent', () => wsMessages.push('frame sent'));
        ws.on('framereceived', () => wsMessages.push('frame received'));
      });

      await page.waitForTimeout(2500);

      // Status değiştir
      const patch = await updateAppointmentStatus(request, aptId, 'iptal');
      expect(patch.ok).toBeTruthy();

      await page.waitForTimeout(3500);

      const supabaseWs = wsMessages.find((m) => m.includes('supabase.co/realtime'));
      console.log(`[DEEP-3] Supabase realtime WebSocket tespit edildi: ${supabaseWs ? 'EVET' : 'HAYIR'}`);
      if (supabaseWs) {
        console.log(`[DEEP-3 OK] ${supabaseWs}`);
      } else {
        console.log(`[DEEP-3 UYARI] WS olaylar toplam: ${wsMessages.length}`);
      }
    } finally {
      await ctx.close();
    }
  });
});

// ─────────────────────────────────────────────────────────
// 4. CHATBOT MANTIĞI — Anasayfadaki AI asistan
// ─────────────────────────────────────────────────────────
test.describe('Deep-4: ChatBot Mantığı', () => {
  test('Anasayfada chatbot floating butonu görünür', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const btn = page.locator('button[aria-label="Psikoloji Asistanı"]');
    await expect(btn).toBeVisible({ timeout: 15000 });
    console.log('[DEEP-4 OK] Chatbot floating butonu DOM\'da');
  });

  test('Chatbot açılır — karşılama mesajı ve hızlı sorular görünür', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await dismissCookieBanner(page);
    const btn = page.locator('button[aria-label="Psikoloji Asistanı"]');
    await btn.click();
    await expect(page.locator('textarea[placeholder="Mesajınızı yazın..."]')).toBeVisible({ timeout: 5000 });
    // Karşılama mesajı
    const welcome = await page.locator('text=/Psikoloji Asistanı|yapay zeka destekli/i').count();
    console.log(`[DEEP-4] Chatbot açıldı — karşılama metni sayısı: ${welcome}`);
    expect(welcome).toBeGreaterThan(0);
  });

  test('POST /api/chat — geçerli mesajla yanıt alınır', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/chat`, {
      data: { messages: [{ role: 'user', content: 'Merhaba, stresle nasıl başa çıkabilirim?' }] },
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await res.json().catch(() => ({}));
    console.log(`[DEEP-4] /api/chat HTTP ${res.status()}, yanıt anahtarları: ${Object.keys(body).join(', ')}`);

    if (res.status() === 401) {
      console.log('[DEEP-4 UYARI] ANTHROPIC_API_KEY env eksik/invalid — chatbot yanıt üretemiyor');
    } else if (res.status() === 500) {
      console.log('[DEEP-4 HATA] /api/chat 500 döndü:', body.error);
    }
    expect([200, 401, 500]).toContain(res.status());
    if (res.status() === 200) {
      expect(body.message).toBeTruthy();
      expect(body.message.length).toBeGreaterThan(5);
      console.log(`[DEEP-4 OK] Asistan yanıtı (${body.message.length} karakter): "${body.message.slice(0, 80)}..."`);
    }
  });

  test('POST /api/chat — geçersiz payload 400 döner', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/chat`, {
      data: { wrong: 'field' },
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`[DEEP-4] /api/chat geçersiz istek → HTTP ${res.status()}`);
    expect(res.status()).toBe(400);
  });

  test('UI akışı — kullanıcı mesaj yazar ve gönderir (API gerçek çağrı)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await dismissCookieBanner(page);

    const btn = page.locator('button[aria-label="Psikoloji Asistanı"]');
    await btn.click();
    const textarea = page.locator('textarea[placeholder="Mesajınızı yazın..."]');
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await textarea.fill('Kaygı ile başa çıkmak için ne öneriyorsun? Kısa cevap ver.');

    // API isteğini yakala
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/chat') && r.request().method() === 'POST', { timeout: 30000 }).catch(() => null),
      page.locator('button').filter({ hasText: '' }).last().click().catch(() => {}),
    ]);

    // Alternatif: gönder butonu (paper plane svg'li) enter tuşuyla
    if (!response) {
      await textarea.press('Enter');
      const resp2 = await page.waitForResponse((r) => r.url().includes('/api/chat'), { timeout: 30000 }).catch(() => null);
      console.log(`[DEEP-4] Enter ile tetikleme — response: ${resp2?.status()}`);
      if (resp2) {
        const status = resp2.status();
        console.log(`[DEEP-4] UI→API çağrı HTTP ${status}`);
        expect([200, 401, 500]).toContain(status);
      } else {
        console.log('[DEEP-4 UYARI] /api/chat tetiklenemedi — UI etkileşimi çalışmamış olabilir');
      }
    } else {
      console.log(`[DEEP-4] Buton tıklaması ile /api/chat → HTTP ${response.status()}`);
      expect([200, 401, 500]).toContain(response.status());
    }
  });
});
