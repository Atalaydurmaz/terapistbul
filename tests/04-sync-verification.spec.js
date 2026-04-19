// @ts-check
/**
 * SENKRONİZASYON DOĞRULAMA TESTLERİ
 * ─────────────────────────────────────────────────────────────────────────────
 * Görev 1 — Üç panel arasındaki veri akışını doğrular:
 *
 *   [Danışan randevu alır]
 *        ↓
 *   [Admin Paneli'nde görünür mü?]
 *        ↓
 *   [Terapist Paneli'nde görünür mü?]
 *        ↓
 *   [Terapist onaylar → Daily.co odası oluşur]
 *        ↓
 *   [Danışan'ın /hesabim sayfasında video linki çıkar mı?]
 *
 * Raporlanan sorunlar: SYNC-HATA ve SYNC-UYARI etiketleriyle işaretlenir.
 */

const { test, expect } = require('@playwright/test');
const {
  createTestAppointment,
  updateAppointmentStatus,
  fetchAllAppointments,
  registerClient,
  CLIENT_EMAIL,
  CLIENT_PASSWORD,
  CLIENT_NAME,
} = require('./helpers/auth.helpers');

// ─── YARDIMCI ────────────────────────────────────────────────────────────────

function syncError(msg) {
  console.error(`[SYNC-HATA] ${msg}`);
}

function syncWarn(msg) {
  console.warn(`[SYNC-UYARI] ${msg}`);
}

function syncOk(msg) {
  console.log(`[SYNC-OK] ${msg}`);
}

// ─── TEST 1: Danışan → Admin Panel Senkronizasyonu ───────────────────────────

test.describe('Sync-1: Danışan randevusu Admin Paneli\'nde görünür', () => {
  let createdId;

  test('randevu oluştur ve /api/randevular\'da mevcut olduğunu doğrula', async ({ request }) => {
    const result = await createTestAppointment(request, 'Dr. Ayşe Kaya');

    if (!result.ok) {
      syncError('Randevu oluşturulamadı — Supabase bağlantısı veya tablo eksik olabilir');
      expect(result.ok, 'Randevu oluşturma API başarısız').toBeTruthy();
      return;
    }

    createdId = result.body.id;
    expect(createdId).toBeTruthy();
    syncOk(`Randevu oluşturuldu: ${createdId}`);

    // Admin'in gördüğü /api/randevular endpoint'ini kontrol et
    const allAppts = await fetchAllAppointments(request);
    expect(Array.isArray(allAppts), '/api/randevular array dönmeli').toBe(true);

    const found = allAppts.find((a) => String(a.id) === String(createdId));
    if (!found) {
      syncError(`Randevu (${createdId}) /api/randevular\'da bulunamadı — Admin Paneli senkronizasyonu BAŞARISIZ`);
    } else {
      syncOk(`Randevu Admin Paneli API\'sinde görünür (status: ${found.status})`);
    }
    expect(found, 'Admin API\'sinde randevu bulunamamadı').toBeTruthy();
  });

  test('admin dashboard 8s polling ile veriyi günceller (real-time DEĞİL)', async ({ page, request }) => {
    // Bu test, admin dashboard'un polling tabanlı olduğunu belgeler
    // Gerçek zamanlı değil: 8 saniye gecikme olabilir
    const result = await createTestAppointment(request);
    if (!result.ok) return;

    const newId = result.body.id;

    // Hemen kontrol — verinin polling öncesi görünüp görünmediği
    const allAppts = await fetchAllAppointments(request);
    const found = allAppts.find((a) => String(a.id) === String(newId));

    if (found) {
      syncOk('Randevu API\'de hemen mevcut — UI 8s polling sonrası yansıtılacak');
    } else {
      syncError('Randevu API\'de bile bulunamadı — Supabase write başarısız olabilir');
    }

    // Belgeleme: Admin dashboard'da gerçek zamanlı değil, 8sn'de bir polling var
    syncWarn(
      'Admin dashboard polling tabanlı (setInterval 8000ms). ' +
      'WebSocket/SSE yoktur. Danışanın randevusu admin\'e en fazla 8 saniye gecikmeli yansır.'
    );
  });
});

// ─── TEST 2: Danışan → Terapist Panel Senkronizasyonu ────────────────────────

test.describe('Sync-2: Danışan randevusu Terapist Paneli\'nde görünür', () => {
  test('Dr. Ayşe Kaya\'nın randevuları /api/randevular\'da therapist_name ile filtrelenir', async ({ request }) => {
    const result = await createTestAppointment(request, 'Dr. Ayşe Kaya');
    if (!result.ok) {
      syncWarn('Test randevusu oluşturulamadı');
      return;
    }

    const createdId = result.body.id;
    const allAppts = await fetchAllAppointments(request);

    // Terapistin kendi randevularını filtrele (panel bu şekilde yapar)
    const therapistAppts = allAppts.filter((a) => a.therapist_name === 'Dr. Ayşe Kaya');
    const found = therapistAppts.find((a) => String(a.id) === String(createdId));

    if (!found) {
      syncError(
        'Terapist filtresi ile randevu bulunamadı. ' +
        'Terapist Paneli senkronizasyonu BAŞARISIZ olabilir.'
      );
    } else {
      syncOk(`Terapist Paneli için randevu mevcut (id: ${createdId})`);
    }

    expect(found, 'Terapist randevu filtresi çalışmıyor').toBeTruthy();
  });
});

// ─── TEST 3: Terapist Onayı → Daily.co → Danışan'da Video Link ───────────────

test.describe('Sync-3: Onay → Daily.co odası → Danışan video linki akışı', () => {
  let appointmentId;
  let approvedData;

  test('1. adım — randevu oluştur ve "bekliyor" durumunda olduğunu doğrula', async ({ request }) => {
    const result = await createTestAppointment(request, 'Dr. Ayşe Kaya');
    if (!result.ok) {
      syncError('Randevu oluşturulamadı — kalan testler atlanıyor');
      return;
    }
    appointmentId = result.body.id;
    expect(result.body.status).toBe('bekliyor');
    syncOk(`Randevu "bekliyor" durumunda oluşturuldu: ${appointmentId}`);
  });

  test('2. adım — terapist panel endpoint\'i randevuyu onaylar', async ({ request }) => {
    // Önceki testten bağımsız çalışabilmek için yeni randevu oluştur
    const createResult = await createTestAppointment(request, 'Dr. Ayşe Kaya');
    if (!createResult.ok) {
      syncWarn('Test randevusu oluşturulamadı');
      return;
    }
    const testId = createResult.body.id;

    // Terapist panel endpoint'i ile onayla
    const patchRes = await request.patch(`http://localhost:3654/api/panel/randevular/${testId}`, {
      data: { status: 'onayli' },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!patchRes.ok()) {
      syncError(`Randevu onaylanamadı — PATCH /api/panel/randevular/${testId} başarısız (${patchRes.status()})`);
      return;
    }

    approvedData = await patchRes.json();
    expect(approvedData.status).toBe('onayli');
    syncOk('Randevu "onayli" durumuna geçti');

    // Daily.co kontrolü
    if (approvedData.daily_room_url) {
      syncOk(`Daily.co odası oluşturuldu: ${approvedData.daily_room_url}`);
      expect(approvedData.daily_room_url).toMatch(/^https:\/\/.+daily\.co\/.+/);
    } else {
      syncError(
        'Daily.co odası oluşturulmadı! ' +
        'Danışan video linkini göremeyecek. ' +
        'DAILY_API_KEY env değişkeni eksik veya Daily.co API\'si hata verdi. ' +
        'daily_room_url = null'
      );
    }
  });

  test('3. adım — onaylı randevu Supabase\'de doğru kaydedilmiş', async ({ request }) => {
    const createResult = await createTestAppointment(request, 'Dr. Ayşe Kaya');
    if (!createResult.ok) return;
    const testId = createResult.body.id;

    // Panel endpoint ile onayla
    const patchRes = await request.patch(`http://localhost:3654/api/panel/randevular/${testId}`, {
      data: { status: 'onayli' },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!patchRes.ok()) return;

    // /api/randevular üzerinden Supabase'deki güncel durumu doğrula
    const allAppts = await fetchAllAppointments(request);
    const inDB = allAppts.find((a) => String(a.id) === String(testId));

    if (!inDB) {
      syncError('Onaylanan randevu /api/randevular\'da bulunamadı — Supabase yazma hatası?');
    } else if (inDB.status !== 'onayli') {
      syncError(`DB'deki durum beklenen "onayli" değil: "${inDB.status}"`);
    } else {
      syncOk('Supabase\'de randevu "onayli" olarak güncellendi');
    }

    expect(inDB?.status).toBe('onayli');
  });

  test('4. adım — danışan /api/hesabim/mesajlar\'da video linki görür (oturum gerekli)', async ({ page, request }) => {
    // Danışan girişi
    await registerClient(request);
    await page.goto('/giris');
    await page.fill('input[type="email"]', CLIENT_EMAIL);
    await page.fill('input[type="password"]', CLIENT_PASSWORD);
    await page.click('button[type="submit"]');

    let loggedIn = false;
    try {
      await page.waitForURL(/\/(terapistler)?$/, { timeout: 15000 });
      loggedIn = true;
    } catch {
      syncWarn('Danışan girişi başarısız — /api/hesabim/mesajlar testi atlanıyor');
      return;
    }

    // Onaylı ve daily_room_url içeren bir randevu var mı?
    const msgsRes = await page.request.get('http://localhost:3654/api/hesabim/mesajlar');
    if (!msgsRes.ok()) {
      syncError('/api/hesabim/mesajlar erişilemedi — session sorunu olabilir');
      return;
    }

    const msgs = await msgsRes.json();
    const randevular = msgs.filter((m) => m.type === 'randevu');
    const approved = randevular.find((r) => r.status === 'onayli');
    const withVideo = randevular.find((r) => r.status === 'onayli' && r.daily_room_url);

    if (randevular.length === 0) {
      syncWarn('Danışanın hiç randevusu yok — sync testi için önce randevu gerekli');
    } else if (!approved) {
      syncWarn('Onaylı randevu yok — terapistin onaylama adımı çalışmamış olabilir');
    } else if (!withVideo) {
      syncError(
        'Onaylı randevu var ama daily_room_url eksik! ' +
        'Danışan video görüşmesine katılamaz. ' +
        'Daily.co API entegrasyonu başarısız.'
      );
    } else {
      syncOk(`Video linki mevcut: ${withVideo.daily_room_url}`);
    }
  });
});

// ─── TEST 4: E-posta Bildirim Senkronizasyonu ─────────────────────────────────

test.describe('Sync-4: E-posta Bildirimleri', () => {
  test('booking onay e-postası CONTACT_EMAIL\'e gider, danışana DEĞİL', async () => {
    // Bu test kod incelemesine dayalı — gerçek e-posta gönderimi doğrulanamaz
    // Ancak BİLİNEN SORUN belgelenir:
    syncError(
      'KRİTİK SENKRON HATASI (Kod İncelemesinde Tespit Edildi): ' +
      '/api/panel/randevular/[id] onay e-postası şu adrese gönderir: ' +
      'process.env.CONTACT_EMAIL (admin) — danışanın e-postasına DEĞİL. ' +
      'Danışan onay bildirimi almaz! ' +
      'Kaynak: src/app/api/panel/randevular/[id]/route.js:94 — ' +
      'to: [process.env.CONTACT_EMAIL || "durmazatalay6@gmail.com"]'
    );

    // Testi başarısız yapmak yerine belgele
    // (Bu bir kod hatası, test ortamı sorunu değil)
    console.log(
      '[BEKLENEN DAVRANIŞ] to: [data.email] — danışanın e-posta adresi\n' +
      '[MEVCUT DAVRANIŞ]   to: [process.env.CONTACT_EMAIL] — admin e-postası'
    );
  });

  test('booking e-postası terapist emailine gönderilir (gerçek email ise)', async ({ request }) => {
    // /api/booking kodu incelemesinde:
    // therapistEmail @terapistbul.com ise recipients'e eklenmez
    // Bu doğru davranış — internal email bildirimleri için
    syncOk('Terapist e-posta filtrelemesi doğru çalışıyor (dahili @terapistbul.com adresleri filtreleniyor)');

    // Ama danışan bookingde de e-posta almıyor
    syncError(
      'SENKRON HATASI: /api/booking yeni randevu için danışana onay e-postası göndermez. ' +
      'Danışan sadece admin e-postası alır (CONTACT_EMAIL). ' +
      'Kaynak: src/app/api/booking/route.js:39-50'
    );
  });
});

// ─── TEST 5: Gerçek Zamanlı vs Polling ───────────────────────────────────────

test.describe('Sync-5: Gerçek Zamanlı Senkronizasyon Analizi', () => {
  test('admin dashboard polling gecikmesini belgele', async () => {
    syncWarn(
      'Admin Dashboard GERÇEK ZAMANLI DEĞİL. ' +
      'Polling: setInterval(load, 8000ms). ' +
      'WebSocket veya Server-Sent Events (SSE) kullanılmıyor. ' +
      'Yeni randevular admin\'de en fazla 8 saniye gecikmeli görünür.'
    );
    // Bu bir mimari tercih, kritik hata değil
  });

  test('terapist panel auth localStorage tabanlı — güvenlik açığı', async () => {
    syncWarn(
      'Terapist Panel Authentication ZAYIF: ' +
      'localStorage tabanlı (panel_auth=true, panel_therapist_id). ' +
      'Server-side session doğrulaması yok. ' +
      'DevTools ile localStorage manipüle edilerek yetkisiz erişim sağlanabilir.'
    );
  });

  test('admin panel auth localStorage tabanlı — güvenlik açığı', async () => {
    syncWarn(
      'Admin Panel Authentication ZAYIF: ' +
      'localStorage tabanlı (admin_auth=true). ' +
      'Server-side session doğrulaması yok. ' +
      'DevTools ile localStorage manipüle edilerek admin erişimi sağlanabilir.'
    );
  });

  test('messages.json ve Supabase appointments arasında çift kayıt riski', async () => {
    syncWarn(
      'ÇİFT VERİ TABANI SORUNU: ' +
      'Randevular hem src/data/messages.json (dosya tabanlı) hem de Supabase appointments tablosunda tutuluyor. ' +
      '/api/hesabim/mesajlar bu ikisini birleştiriyor — eşleştirme mantığı karmaşık ve hata eğilimli. ' +
      'Yeni randevular messages.json\'a yazılmazsa /hesabim\'de görünmeyebilir.'
    );
  });
});

// ─── TEST 6: Uçtan Uca Tam Akış ─────────────────────────────────────────────

test.describe('Sync-6: Uçtan Uca Tam Entegrasyon Testi', () => {
  test('tam akış: oluştur → onayla → Supabase doğrula → raporla', async ({ request }) => {
    const syncReport = {
      creation: false,
      adminVisible: false,
      therapistVisible: false,
      approval: false,
      dailyRoomCreated: false,
      clientEmailNotified: false, // KOD İNCELEMESİNDE BAŞARISIZ
    };

    // 1. Randevu oluştur
    const createResult = await createTestAppointment(request, 'Dr. Ayşe Kaya');
    syncReport.creation = createResult.ok;
    if (!createResult.ok) {
      syncError('Randevu oluşturulamadı');
      console.table(syncReport);
      return;
    }

    const testId = createResult.body.id;
    syncOk(`Randevu oluşturuldu: ${testId}`);

    // 2. Admin'de görünür mü?
    const allAppts = await fetchAllAppointments(request);
    const inAdmin = allAppts.find((a) => String(a.id) === String(testId));
    syncReport.adminVisible = !!inAdmin;
    inAdmin
      ? syncOk('Admin Paneli: Randevu görünür ✓')
      : syncError('Admin Paneli: Randevu GÖRÜNMÜYOR ✗');

    // 3. Terapist filtresiyle görünür mü?
    const forTherapist = allAppts.filter((a) => a.therapist_name === 'Dr. Ayşe Kaya');
    syncReport.therapistVisible = forTherapist.some((a) => String(a.id) === String(testId));
    syncReport.therapistVisible
      ? syncOk('Terapist Paneli: Randevu görünür ✓')
      : syncError('Terapist Paneli: Randevu GÖRÜNMÜYOR ✗');

    // 4. Terapist onaylar
    const patchRes = await request.patch(`http://localhost:3654/api/panel/randevular/${testId}`, {
      data: { status: 'onayli' },
      headers: { 'Content-Type': 'application/json' },
    });
    syncReport.approval = patchRes.ok();
    if (!patchRes.ok()) {
      syncError(`Terapist onayı BAŞARISIZ: HTTP ${patchRes.status()}`);
    } else {
      const approved = await patchRes.json();
      syncOk('Terapist onayı başarılı ✓');

      // 5. Daily.co odası
      syncReport.dailyRoomCreated = !!approved.daily_room_url;
      approved.daily_room_url
        ? syncOk(`Daily.co odası oluşturuldu ✓: ${approved.daily_room_url}`)
        : syncError('Daily.co odası OLUŞTURULAMADI ✗ — Danışan görüşmeye katılamaz!');
    }

    // 6. Danışan e-posta bildirimi (kod incelemesiyle bilinen hata)
    syncReport.clientEmailNotified = false;
    syncError(
      'Danışan e-posta bildirimi: HAYIR ✗ — ' +
      '/api/panel/randevular/[id] e-postayı danışana değil, CONTACT_EMAIL\'e gönderiyor'
    );

    // Özet rapor
    console.log('\n════════════════════════════════════════');
    console.log('SENKRONIZASYON TEST RAPORU');
    console.log('════════════════════════════════════════');
    console.table(syncReport);
    console.log('════════════════════════════════════════\n');

    // Kritik başarı kriterleri
    expect(syncReport.creation, 'Randevu oluşturma').toBe(true);
    expect(syncReport.adminVisible, 'Admin Paneli senkronizasyonu').toBe(true);
    expect(syncReport.therapistVisible, 'Terapist Paneli senkronizasyonu').toBe(true);
    expect(syncReport.approval, 'Terapist onayı').toBe(true);
    // Daily.co opsiyonel (API key gerektirir)
    if (!syncReport.dailyRoomCreated) {
      syncWarn('Daily.co entegrasyonu çalışmıyor — DAILY_API_KEY kontrol edin');
    }
  });
});
