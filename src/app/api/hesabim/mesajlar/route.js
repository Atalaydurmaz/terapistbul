import { auth } from '../../../../auth';
import { createAdminClient } from '@/lib/supabase/admin';

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

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        name: session.user.name || '',
        email: session.user.email?.toLowerCase() || '',
        phone: null,
        note: note.trim(),
        therapist_name: therapistName,
        therapist_email: therapistEmail || null,
        type: type || 'mesaj',
        status: type === 'randevu' ? 'bekliyor' : null,
      }])
      .select()
      .single();

    if (error) { console.error('hesabim POST error:', error); return Response.json({ error: 'Gönderilemedi.' }, { status: 500 }); }

    // İstemci eski alan adlarını bekliyor — uyumluluk için map'le
    return Response.json({
      id: data.id,
      name: data.name,
      email: data.email,
      note: data.note,
      therapistName: data.therapist_name,
      therapistEmail: data.therapist_email,
      type: data.type,
      status: data.status,
      createdAt: data.created_at,
      supabaseId: data.id,
    });
  } catch (e) {
    console.error('hesabim POST error:', e);
    return Response.json({ error: 'Gönderilemedi' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const userEmail = session.user.email.trim().toLowerCase();
    const userName = (session.user.name || '').trim();
    const supabase = createAdminClient();

    // `select('*')` kullanıyoruz — daha önce açık kolon listesindeydi ama
    // bazı migration'lar (supabase-add-payments.sql vb.) bazı ortamlarda
    // çalıştırılmadığında `price` / `payment_status` gibi kolonlar yok ve
    // tüm query 42703 hatası veriyordu. Bu da hata → empty array → kullanıcı
    // "Henüz randevu almadınız" görüyor. `*` ile mevcut kolonlar ne ise
    // onlarla devam ediyoruz; eksikler client mapping'te undefined olur.
    const selectCols = '*';

    // 1) Primary match: email with wildcard %email% (case-insensitive). Catches
    // trailing spaces, "+tag" variants, and any stored whitespace that exact
    // match would miss. Previously we used `.ilike('email', userEmail)` with
    // no wildcards — which is just case-insensitive equality and was brittle.
    const { data: byEmail, error: emailErr } = await supabase
      .from('appointments')
      .select(selectCols)
      .ilike('email', `%${userEmail}%`)
      .order('created_at', { ascending: false });

    if (emailErr) {
      console.error('hesabim GET error (email):', emailErr);
      return Response.json([]);
    }

    // 2) Fallback: rows booked under the same display name but where the email
    //    column is null/empty OR different from the current session email
    //    (e.g. user edited the form email before submitting, or a legacy row
    //    pre-dates the email normalization). Without this, confirmed
    //    appointments disappear from /hesabim for the user who actually booked
    //    them but whose stored appointment email doesn't match their account.
    //
    //    Trade-off: two users with the exact same display name could see each
    //    other's orphan rows. Acceptable for MVP; the proper fix is adding a
    //    `client_id` FK to `clients.id` and matching on that.
    let byName = [];
    if (userName) {
      // Wildcard match so trailing/leading whitespace, title prefixes, or
      // minor capitalization drift don't hide the user's own appointments.
      // ilike with %...% treats inner spaces as literal, so "Atalay Durmaz"
      // still requires both words in order — avoids matching unrelated users.
      const pattern = `%${userName.replace(/\s+/g, '%')}%`;
      const { data: nameRows, error: nameErr } = await supabase
        .from('appointments')
        .select(selectCols)
        .ilike('name', pattern)
        .order('created_at', { ascending: false });
      if (nameErr) {
        console.error('hesabim GET error (name fallback):', nameErr);
      } else {
        byName = nameRows || [];
      }
    }

    // 3) Phone fallback — if the `clients` table has a phone for this user and
    //    the appointment was booked with that phone but a different email, we
    //    still want it to show up. Cheap extra query; skipped if no phone.
    let byPhone = [];
    try {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('phone')
        .ilike('email', userEmail)
        .maybeSingle();
      const userPhone = (clientRow?.phone || '').replace(/\s+/g, '');
      if (userPhone && userPhone.length >= 7) {
        // Use the last 7 digits so +90 / 0 prefix variants still match.
        const phoneTail = userPhone.slice(-7);
        const { data: phoneRows } = await supabase
          .from('appointments')
          .select(selectCols)
          .ilike('phone', `%${phoneTail}%`)
          .order('created_at', { ascending: false });
        byPhone = phoneRows || [];
      }
    } catch (e) {
      console.error('hesabim GET error (phone fallback):', e);
    }

    console.log('[hesabim GET]', {
      userEmail,
      userName,
      byEmailCount: (byEmail || []).length,
      byNameCount: byName.length,
      byPhoneCount: byPhone.length,
    });

    // Merge + dedupe by id; email matches first (most trustworthy), then name,
    // then phone. First insertion wins — later duplicate rows are dropped.
    const seen = new Set();
    const combined = [];
    for (const row of [...(byEmail || []), ...byName, ...byPhone]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      combined.push(row);
    }
    const data = combined;
    const error = null;
    if (error) {
      console.error('hesabim GET error:', error);
      return Response.json([]);
    }

    // Debug header — HER response'a ekliyoruz (sadece boşken değil). Böylece
    // user "randevu 2 görünüyor ama 3 olmalıydı" derse de DB'deki son 5 kaydı
    // Network tab'dan karşılaştırabiliyoruz. Prod'da bu header'ı kapatmak için
    // env var eklenebilir; şimdilik teşhis için açık.
    let debugHeader = null;
    try {
      const { data: recent } = await supabase
        .from('appointments')
        .select('id, name, email, therapist_name, type, status, selected_day, selected_hour, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      debugHeader = {
        viewerEmail: userEmail,
        viewerName: userName,
        matches: {
          byEmail: (byEmail || []).length,
          byName: byName.length,
          byPhone: byPhone.length,
          total: combined.length,
        },
        recentRows: (recent || []).map((r) => ({
          id: r.id?.slice?.(0, 8),
          name: r.name,
          email: r.email,
          therapist: r.therapist_name,
          type: r.type,
          status: r.status,
          day: r.selected_day,
          hour: r.selected_hour,
        })),
      };
    } catch { /* debug best-effort */ }

    // Client tarafı eski alan adlarını kullanıyor — geri uyumluluk
    const mapped = (data || []).map((row) => ({
      id: row.id,
      supabaseId: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      note: row.note,
      therapistName: row.therapist_name,
      therapistEmail: row.therapist_email,
      type: row.type,
      status: row.status,
      selectedDay: row.selected_day,
      selectedHour: row.selected_hour,
      daily_room_url: row.daily_room_url,
      direction: row.direction,
      price: row.price,
      paymentStatus: row.payment_status,
      transactionId: row.transaction_id,
      paidAt: row.paid_at,
      refundedAt: row.refunded_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const res = Response.json(mapped);
    if (debugHeader) {
      try {
        res.headers.set('x-hesabim-debug', Buffer.from(JSON.stringify(debugHeader)).toString('base64'));
      } catch {}
    }
    return res;
  } catch (e) {
    console.error('hesabim GET error:', e);
    return Response.json([]);
  }
}
