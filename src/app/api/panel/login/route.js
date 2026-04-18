import { createAdminClient } from '@/lib/supabase/admin';
import { therapists as staticTherapists } from '@/data/therapists';

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
      return Response.json({ id: t.id, name: t.name });
    }
  }

  // 2. Supabase therapists (aktif, DB'ye sonradan eklenmiş)
  const supabase = createAdminClient();
  const { data: dbTherapists } = await supabase
    .from('therapists')
    .select('id, name, email')
    .eq('status', 'aktif');

  if (dbTherapists) {
    for (const t of dbTherapists) {
      // initials formatıyla eşleş
      const initEmail = `${nameToInitials(t.name)}@terapistbul.com`;
      if (initEmail === normalizedEmail || (t.email && t.email.toLowerCase() === normalizedEmail)) {
        return Response.json({ id: t.id, name: t.name });
      }
    }
  }

  // 3. Applications tablosundan email eşleş (başvurusu onaylanan terapist)
  const { data: app } = await supabase
    .from('applications')
    .select('name, email')
    .eq('email', normalizedEmail)
    .eq('status', 'approved')
    .maybeSingle();

  if (app) {
    // therapists tablosunda adıyla ara
    const { data: matchedT } = await supabase
      .from('therapists')
      .select('id, name')
      .ilike('name', `%${app.name.split(' ').slice(-1)[0]}%`)
      .eq('status', 'aktif')
      .maybeSingle();
    if (matchedT) {
      return Response.json({ id: matchedT.id, name: matchedT.name });
    }
    return Response.json({ id: app.email, name: app.name });
  }

  return Response.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
}
