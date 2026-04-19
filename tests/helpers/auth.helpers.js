// @ts-check
const { expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3654';

// Admin kimlik bilgileri (hardcoded demo — admin/giris/page.js'den)
const ADMIN_EMAIL = 'admin@terapistbul.com';
const ADMIN_PASSWORD = 'admin123';

// Statik terapist hesabı (Dr. Ayşe Kaya — initials: AK)
const STATIC_THERAPIST_EMAIL = 'ak@terapistbul.com';
const STATIC_THERAPIST_PASSWORD = '123456';

// Test danışan
const CLIENT_EMAIL = 'durmazatalay6+danisan@gmail.com';
const CLIENT_PASSWORD = 'Test1234!';
const CLIENT_NAME = 'Test Danışan';

// Test terapist başvurusu için email
const THERAPIST_APP_EMAIL = 'durmazatalay6+terapist@gmail.com';
const THERAPIST_APP_PASSWORD = '123456';

/**
 * Admin paneline giriş yapar (localStorage tabanlı auth)
 */
async function loginAsAdmin(page) {
  await page.goto('/admin/giris');
  // Layout'ta da h1 olabilir; login formundaki başlığı filtrele
  await expect(page.locator('h1').filter({ hasText: 'Admin Girişi' })).toBeVisible();
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
}

/**
 * Terapist paneline giriş yapar (localStorage tabanlı auth)
 * Önce belirtilen email'i dener, başarısız olursa statik hesabı kullanır.
 */
async function loginAsTherapist(page, email = STATIC_THERAPIST_EMAIL, password = STATIC_THERAPIST_PASSWORD) {
  await page.goto('/panel/giris');
  await expect(page.locator('h1').filter({ hasText: 'Terapist Girişi' })).toBeVisible();
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/panel/dashboard', { timeout: 10000 });
}

/**
 * Danışan olarak NextAuth ile giriş yapar (UI üzerinden)
 */
async function loginAsClient(page, email = CLIENT_EMAIL, password = CLIENT_PASSWORD) {
  await page.goto('/giris');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Terapistler sayfasına yönlenir ya da ana sayfada kalır
  await page.waitForURL(/\/(terapistler|hesabim)?$/, { timeout: 15000 });
}

/**
 * Danışan kaydı (API üzerinden)
 * Zaten kayıtlıysa 409 döner — bu kabul edilebilir.
 */
async function registerClient(request, email = CLIENT_EMAIL, password = CLIENT_PASSWORD, name = CLIENT_NAME) {
  const response = await request.post(`${BASE_URL}/api/danisan-kaydol`, {
    data: { name, email, password },
    headers: { 'Content-Type': 'application/json' },
  });
  // 200 (yeni kayıt) veya 409 (zaten kayıtlı) her ikisi de geçerli
  const ok = response.ok() || response.status() === 409;
  return { ok, status: response.status(), body: await response.json().catch(() => ({})) };
}

/**
 * API üzerinden randevu oluşturur (admin client kullanır, session gerektirmez)
 */
async function createTestAppointment(request, therapistName = 'Dr. Ayşe Kaya') {
  const response = await request.post(`${BASE_URL}/api/randevular`, {
    data: {
      name: CLIENT_NAME,
      email: CLIENT_EMAIL,
      phone: '5551234567',
      note: 'Playwright test randevusu — otomatik oluşturuldu',
      therapist_name: therapistName,
      therapist_email: STATIC_THERAPIST_EMAIL,
      type: 'randevu',
      selected_day: 'Pazartesi',
      selected_hour: '10:00',
      status: 'bekliyor',
    },
    headers: { 'Content-Type': 'application/json' },
  });
  return { ok: response.ok(), status: response.status(), body: await response.json().catch(() => ({})) };
}

/**
 * Randevu durumunu günceller (PATCH /api/randevular/:id)
 */
async function updateAppointmentStatus(request, id, status) {
  const response = await request.patch(`${BASE_URL}/api/randevular/${id}`, {
    data: { status },
    headers: { 'Content-Type': 'application/json' },
  });
  return { ok: response.ok(), status: response.status(), body: await response.json().catch(() => ({})) };
}

/**
 * Tüm randevuları çeker (/api/randevular)
 */
async function fetchAllAppointments(request) {
  const response = await request.get(`${BASE_URL}/api/randevular`);
  if (!response.ok()) return [];
  return response.json();
}

module.exports = {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  STATIC_THERAPIST_EMAIL,
  STATIC_THERAPIST_PASSWORD,
  CLIENT_EMAIL,
  CLIENT_PASSWORD,
  CLIENT_NAME,
  THERAPIST_APP_EMAIL,
  THERAPIST_APP_PASSWORD,
  loginAsAdmin,
  loginAsTherapist,
  loginAsClient,
  registerClient,
  createTestAppointment,
  updateAppointmentStatus,
  fetchAllAppointments,
};
