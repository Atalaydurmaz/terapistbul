import { createAdminClient } from '@/lib/supabase/admin';
import { therapists as staticTherapists } from '@/data/therapists';

// GET /api/panel/profil?id=ak
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const panelId = searchParams.get('id');
  if (!panelId) return Response.json({ error: 'id gerekli' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('therapist_profiles')
    .select('*')
    .eq('panel_id', panelId)
    .maybeSingle();

  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data || {});
}

// PATCH /api/panel/profil  body: { panel_id, available_days, day_hours, ... }
export async function PATCH(req) {
  const body = await req.json();
  const { panel_id, name, title, city, specialties, approaches, ...rest } = body;
  if (!panel_id) return Response.json({ error: 'panel_id gerekli' }, { status: 400 });

  const supabase = createAdminClient();

  // therapist_profiles tablosunu güncelle (sadece bu tabloda var olan kolonlar)
  const profileRow = {
    panel_id,
    available_days: rest.available_days,
    day_hours: rest.day_hours,
    price: rest.price,
    duration: rest.duration,
    is_online: rest.is_online,
    is_face_to_face: rest.is_face_to_face,
    about: rest.about,
    education: rest.education,
    photo_url: rest.photo_url,
    gallery_photos: rest.gallery_photos,
    intro_video_url: rest.intro_video_url,
    updated_at: new Date().toISOString(),
  };
  // undefined değerleri temizle
  Object.keys(profileRow).forEach((k) => profileRow[k] === undefined && delete profileRow[k]);

  const { data, error } = await supabase
    .from('therapist_profiles')
    .upsert(profileRow, { onConflict: 'panel_id' })
    .select()
    .single();

  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }

  // therapists tablosunu da güncelle (site listesinde görünsün)
  const staticT = staticTherapists.find((t) => t.id === panel_id);
  // Supabase'deki kayıt orijinal tam isimle (Dr./Uzm. dahil) aranır
  const lookupName = staticT?.name;
  if (lookupName) {
    const updates = {};
    if (title) updates.title = title;
    if (city) updates.city = city;
    if (specialties?.length) updates.specialties = specialties;
    if (approaches?.length) updates.approaches = approaches;
    if (rest.about !== undefined) updates.about = rest.about;
    if (rest.education !== undefined) updates.education = rest.education;
    if (rest.price !== undefined) updates.price = Number(rest.price) || 0;
    if (rest.is_online !== undefined) updates.online = rest.is_online;
    if (rest.is_face_to_face !== undefined) updates.in_person = rest.is_face_to_face;
    if (rest.photo_url !== undefined) updates.photo_url = rest.photo_url;
    if (Object.keys(updates).length > 0) {
      await supabase.from('therapists').update(updates).eq('name', lookupName);
    }
  }

  return Response.json(data);
}
