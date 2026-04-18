import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { auth } from '../../../../auth';
import { createAdminClient } from '@/lib/supabase/admin';

const MESSAGES_FILE = join(process.cwd(), 'src', 'data', 'messages.json');

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  try {
    const { note, therapistName, therapistEmail, type } = await req.json();
    if (!note?.trim() || !therapistName) {
      return Response.json({ error: 'Eksik alan' }, { status: 400 });
    }
    const messages = JSON.parse(readFileSync(MESSAGES_FILE, 'utf8'));
    const newMsg = {
      name: session.user.name || '',
      email: session.user.email,
      phone: '',
      note: note.trim(),
      therapistName,
      therapistEmail: therapistEmail || '',
      type: type || 'mesaj',
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    messages.push(newMsg);
    writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    return Response.json(newMsg);
  } catch {
    return Response.json({ error: 'Gönderilemedi' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const messages = JSON.parse(readFileSync(MESSAGES_FILE, 'utf8'));
    const userEmail = session.user.email.toLowerCase();
    const userMessages = messages.filter(
      (m) => m.email?.toLowerCase() === userEmail || m.toEmail?.toLowerCase() === userEmail
    );

    // Randevular için Supabase'den güncel status ve daily_room_url çek
    const randevuIds = userMessages.filter((m) => m.type === 'randevu' && m.supabaseId).map((m) => m.supabaseId);
    let supabaseMap = {};
    if (randevuIds.length > 0) {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from('appointments')
        .select('id, status, daily_room_url, therapist_name')
        .in('id', randevuIds);
      if (data) data.forEach((row) => { supabaseMap[row.id] = row; });
    }

    // messages.json'daki randevular için email ile de eşleştir
    const supabase2 = createAdminClient();
    const { data: supabaseRandevular } = await supabase2
      .from('appointments')
      .select('id, status, daily_room_url, therapist_name, selected_day, selected_hour, created_at, name, email')
      .eq('email', userEmail);

    const supabaseEmailMap = {};
    if (supabaseRandevular) {
      supabaseRandevular.forEach((row) => { supabaseEmailMap[row.id] = row; });
    }

    // userMessages içindeki randevuları güncelle
    const enriched = userMessages.map((m) => {
      if (m.type !== 'randevu') return m;
      // supabaseId ile eşleştir
      if (m.supabaseId && supabaseMap[m.supabaseId]) {
        const sb = supabaseMap[m.supabaseId];
        return { ...m, status: sb.status, daily_room_url: sb.daily_room_url };
      }
      // email + therapistName ile supabase randevusunu bul
      if (supabaseRandevular) {
        const match = supabaseRandevular.find(
          (sb) => sb.email?.toLowerCase() === userEmail &&
          (sb.therapist_name === m.therapistName || sb.therapist_name === m.name)
        );
        if (match) return { ...m, status: match.status, daily_room_url: match.daily_room_url, supabaseId: match.id };
      }
      return m;
    });

    // Supabase'de olup messages.json'da olmayan randevuları da ekle
    if (supabaseRandevular) {
      for (const sb of supabaseRandevular) {
        const exists = enriched.some(
          (m) => m.type === 'randevu' && (m.supabaseId === sb.id ||
            (m.email?.toLowerCase() === userEmail && m.therapistName === sb.therapist_name))
        );
        if (!exists) {
          enriched.push({
            id: sb.id,
            supabaseId: sb.id,
            name: sb.name,
            email: sb.email,
            therapistName: sb.therapist_name,
            selectedDay: sb.selected_day,
            selectedHour: sb.selected_hour,
            type: 'randevu',
            status: sb.status,
            daily_room_url: sb.daily_room_url,
            createdAt: sb.created_at,
          });
        }
      }
    }

    return Response.json(enriched);
  } catch (e) {
    console.error('hesabim GET error:', e);
    return Response.json([]);
  }
}
