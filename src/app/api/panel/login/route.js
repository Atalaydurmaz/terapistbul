import { createAdminClient } from '@/lib/supabase/admin';
import { therapists as staticTherapists } from '@/data/therapists';
import { signSession, SESSION_COOKIES, sessionCookieOptions } from '@/lib/auth/session';

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

// POST /api/panel/login  { email, password }
export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) return Response.json({ error: 'Eksik alan' }, { status: 400 });
  if (password !== '123456') return Response.json({ error: 'Hatalı şifre' }, { status: 401 });

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Static accounts
  for (const t of staticTherapists) {
    const staticEmail = `${nameToInitials(t.name)}@terapistbul.com`;
    if (staticEmail === normalizedEmail) {
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
    .select('id, name, email')
    .eq('status', 'aktif');

  if (dbTherapists) {
    for (const t of dbTherapists) {
      const initEmail = `${nameToInitials(t.name)}@terapistbul.com`;
      if (initEmail === normalizedEmail || (t.email && t.email.toLowerCase() === normalizedEmail)) {
        return buildResponse(
          { role: 'therapist', therapistId: t.id, email: normalizedEmail, name: t.name },
          { id: t.id, name: t.name },
        );
      }
    }
  }

  // 3. Applications tablosundan email eşleş
  const { data: app } = await supabase
    .from('applications')
    .select('name, email')
    .eq('email', normalizedEmail)
    .eq('status', 'approved')
    .maybeSingle();

  if (app) {
    const { data: matchedT } = await supabase
      .from('therapists')
      .select('id, name')
      .ilike('name', `%${app.name.split(' ').slice(-1)[0]}%`)
      .eq('status', 'aktif')
      .maybeSingle();
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
