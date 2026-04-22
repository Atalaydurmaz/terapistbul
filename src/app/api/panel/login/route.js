import { createAdminClient } from '@/lib/supabase/admin';
import { therapists as staticTherapists } from '@/data/therapists';
import { signSession, SESSION_COOKIES, sessionCookieOptions } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';

function nameToInitials(name) {
  return (name || '')
    .replace(/^(Prof\. Dr\.|Doç\. Dr\.|Dr\.|Uzm\. Psk\.|Uzm\.|Psk\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
    .toLowerCase();
}

async function buildResponse(payload, body) {
  const token = await signSession(payload);
  const res = Response.json(body);
  const opts = sessionCookieOptions();
  const parts = [
    `${SESSION_COOKIES.PANEL}=${token}`,
    `Path=${opts.path}`,
    `Max-Age=${opts.maxAge}`,
    `SameSite=${opts.sameSite === 'lax' ? 'Lax' : opts.sameSite}`,
    'HttpOnly',
  ];
  if (opts.secure) parts.push('Secure');
  res.headers.append('Set-Cookie', parts.join('; '));
  return res;
}

// Geçiş dönemi için: terapistin password_hash'i yoksa env'deki
// PANEL_DEV_PASSWORD ile giriş yapılabilsin. Prod'da bu env UNSET olmalı.
async function checkPassword(row, password) {
  if (row?.password_hash) {
    return verifyPassword(password, row.password_hash);
  }
  const dev = process.env.PANEL_DEV_PASSWORD;
  if (dev && password === dev) return true;
  return false;
}

// POST /api/panel/login  { email, password }
export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) return Response.json({ error: 'Eksik alan' }, { status: 400 });

  const normalizedEmail = String(email).trim().toLowerCase();

  // 1. Static demo accounts (ak@, md@) — parola yok, sadece DEV fallback
  for (const t of staticTherapists) {
    const staticEmail = `${nameToInitials(t.name)}@terapistbul.com`;
    if (staticEmail === normalizedEmail) {
      const ok = await checkPassword(null, password);
      if (!ok) return Response.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
      return buildResponse(
        { role: 'therapist', therapistId: t.id, email: normalizedEmail, name: t.name },
        { id: t.id, name: t.name },
      );
    }
  }

  // 2. Supabase therapists (aktif)
  const supabase = createAdminClient();
  const { data: dbTherapists } = await supabase
    .from('therapists')
    .select('id, name, email, password_hash')
    .eq('status', 'aktif');

  if (dbTherapists) {
    for (const t of dbTherapists) {
      const initEmail = `${nameToInitials(t.name)}@terapistbul.com`;
      const match =
        initEmail === normalizedEmail ||
        (t.email && t.email.toLowerCase() === normalizedEmail);
      if (!match) continue;
      const ok = await checkPassword(t, password);
      if (!ok) return Response.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
      return buildResponse(
        { role: 'therapist', therapistId: t.id, email: normalizedEmail, name: t.name },
        { id: t.id, name: t.name },
      );
    }
  }

  // 3. Applications tablosundan email eşleş (approved)
  const { data: app } = await supabase
    .from('applications')
    .select('name, email')
    .eq('email', normalizedEmail)
    .eq('status', 'approved')
    .maybeSingle();

  if (app) {
    const { data: matchedT } = await supabase
      .from('therapists')
      .select('id, name, password_hash')
      .ilike('name', `%${app.name.split(' ').slice(-1)[0]}%`)
      .eq('status', 'aktif')
      .maybeSingle();

    const ok = await checkPassword(matchedT || null, password);
    if (!ok) return Response.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });

    if (matchedT) {
      return buildResponse(
        { role: 'therapist', therapistId: matchedT.id, email: normalizedEmail, name: matchedT.name },
        { id: matchedT.id, name: matchedT.name },
      );
    }
    return buildResponse(
      { role: 'therapist', therapistId: app.email, email: normalizedEmail, name: app.name },
      { id: app.email, name: app.name },
    );
  }

  return Response.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
}

export async function DELETE() {
  const res = Response.json({ success: true });
  res.headers.append(
    'Set-Cookie',
    `${SESSION_COOKIES.PANEL}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`,
  );
  return res;
}
