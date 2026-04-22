import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { therapists as staticTherapists } from '@/data/therapists';

async function getPanelViewer() {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIES.PANEL)?.value;
    if (!token) return null;
    const payload = await verifySession(token);
    if (payload?.role !== 'therapist') return null;
    return {
      therapistId: payload.therapistId || payload.id || null,
      email: payload.email ? String(payload.email).toLowerCase() : null,
      name: payload.name || null,
    };
  } catch {
    return null;
  }
}

const DEFAULT_SETTINGS = {
  notifs: {
    emailNewBooking: true,
    emailMessage: true,
    emailReminder: false,
    smsNewBooking: true,
    smsReminder: true,
    smsMessage: false,
    pushNewBooking: true,
    pushMessage: true,
    pushReminder: true,
  },
  privacy: {
    profilePublic: true,
    showPhone: false,
    showEmail: false,
    allowAllContact: false,
    allowPatientOnly: true,
  },
  security: {
    twoFactor: false,
  },
};

function mergeSettings(stored) {
  const s = stored && typeof stored === 'object' ? stored : {};
  return {
    notifs: { ...DEFAULT_SETTINGS.notifs, ...(s.notifs || {}) },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...(s.privacy || {}) },
    security: { ...DEFAULT_SETTINGS.security, ...(s.security || {}) },
  };
}

// Therapists tablosundaki satırı bulmaya çalışır.
// panel_id → static therapists'dan isim çıkar → Supabase'de o isimle ara.
// Yoksa cookie'deki email/name üzerinden düşer.
async function findTherapistRow(supabase, viewer) {
  if (viewer.therapistId) {
    const staticT = staticTherapists.find((t) => t.id === viewer.therapistId);
    if (staticT?.name) {
      const { data } = await supabase
        .from('therapists')
        .select('id, name, email, phone, password_hash')
        .eq('name', staticT.name)
        .maybeSingle();
      if (data) return data;
    }
  }
  if (viewer.email) {
    const { data } = await supabase
      .from('therapists')
      .select('id, name, email, phone, password_hash')
      .ilike('email', viewer.email)
      .maybeSingle();
    if (data) return data;
  }
  if (viewer.name) {
    const { data } = await supabase
      .from('therapists')
      .select('id, name, email, phone, password_hash')
      .eq('name', viewer.name)
      .maybeSingle();
    if (data) return data;
  }
  return null;
}

// GET /api/panel/ayarlar
export async function GET() {
  const viewer = await getPanelViewer();
  if (!viewer) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

  if (!viewer.therapistId) {
    return Response.json({
      email: viewer.email || '',
      phone: '',
      hasPassword: false,
      ...mergeSettings(null),
    });
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('therapist_profiles')
    .select('settings')
    .eq('panel_id', viewer.therapistId)
    .maybeSingle();

  const therapistRow = await findTherapistRow(supabase, viewer);

  return Response.json({
    email: therapistRow?.email || viewer.email || '',
    phone: therapistRow?.phone || '',
    hasPassword: !!therapistRow?.password_hash,
    ...mergeSettings(profile?.settings || null),
  });
}

// PUT /api/panel/ayarlar
// body: { section: 'hesap' | 'bildirimler' | 'gizlilik' | 'guvenlik', data: {...} }
export async function PUT(req) {
  const viewer = await getPanelViewer();
  if (!viewer) return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  if (!viewer.therapistId) {
    return Response.json({ error: 'Terapist kimliği yok.' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { section, data } = body || {};
  if (!section || typeof data !== 'object' || data === null) {
    return Response.json({ error: 'Eksik alan' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Mevcut settings'i çek (merge için).
  const { data: existingProfile } = await supabase
    .from('therapist_profiles')
    .select('settings')
    .eq('panel_id', viewer.therapistId)
    .maybeSingle();

  const current = mergeSettings(existingProfile?.settings || null);

  // --- Hesap: email / phone / (opsiyonel) parola değişikliği ---
  if (section === 'hesap') {
    const { email, phone, currentPass, newPass, confirmPass } = data;

    const therapistRow = await findTherapistRow(supabase, viewer);
    if (!therapistRow) {
      return Response.json({ error: 'Terapist kaydı bulunamadı.' }, { status: 404 });
    }

    const updates = {};
    if (typeof email === 'string' && email.trim() && email.trim().toLowerCase() !== (therapistRow.email || '').toLowerCase()) {
      updates.email = email.trim().toLowerCase();
    }
    if (typeof phone === 'string' && phone.trim() !== (therapistRow.phone || '')) {
      updates.phone = phone.trim();
    }

    // Parola değişikliği — üçü de doluysa işle.
    if (newPass || confirmPass || currentPass) {
      if (!newPass || !confirmPass || !currentPass) {
        return Response.json({ error: 'Parola alanlarını eksiksiz doldurun.' }, { status: 400 });
      }
      if (newPass !== confirmPass) {
        return Response.json({ error: 'Yeni parolalar eşleşmiyor.' }, { status: 400 });
      }
      if (newPass.length < 6) {
        return Response.json({ error: 'Parola en az 6 karakter olmalı.' }, { status: 400 });
      }
      // Mevcut parolayı doğrula.
      if (therapistRow.password_hash) {
        const ok = await verifyPassword(currentPass, therapistRow.password_hash);
        if (!ok) return Response.json({ error: 'Mevcut parola hatalı.' }, { status: 401 });
      } else {
        const dev = process.env.PANEL_DEV_PASSWORD;
        if (!dev || currentPass !== dev) {
          return Response.json({ error: 'Mevcut parola hatalı.' }, { status: 401 });
        }
      }
      updates.password_hash = await hashPassword(newPass);
    }

    if (Object.keys(updates).length > 0) {
      const { error: updErr } = await supabase
        .from('therapists')
        .update(updates)
        .eq('id', therapistRow.id);
      if (updErr) {
        console.error('panel ayarlar hesap update error:', updErr);
        return Response.json({ error: 'Güncellenemedi.' }, { status: 500 });
      }
    }

    return Response.json({ success: true });
  }

  // --- Bildirimler / Gizlilik / Güvenlik: settings JSONB'ye yaz ---
  let nextSettings = current;
  if (section === 'bildirimler') {
    nextSettings = { ...current, notifs: { ...current.notifs, ...data } };
  } else if (section === 'gizlilik') {
    nextSettings = { ...current, privacy: { ...current.privacy, ...data } };
  } else if (section === 'guvenlik') {
    nextSettings = { ...current, security: { ...current.security, ...data } };
  } else {
    return Response.json({ error: 'Geçersiz bölüm.' }, { status: 400 });
  }

  const { error: upErr } = await supabase
    .from('therapist_profiles')
    .upsert(
      {
        panel_id: viewer.therapistId,
        settings: nextSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'panel_id' },
    );

  if (upErr) {
    console.error('panel ayarlar settings upsert error:', upErr);
    return Response.json({ error: 'Kaydedilemedi.' }, { status: 500 });
  }

  return Response.json({ success: true, settings: nextSettings });
}
