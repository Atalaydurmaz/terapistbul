import { createAdminClient } from '@/lib/supabase/admin';

// Not: App Router'da `export const config = { api: { bodyParser } }`
// desteklenmiyor. Büyük body'ler için request'i stream edip parse etmek
// gerekiyor — bu endpoint için şu an gerekmiyor.

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('applications GET error:', error);
    return Response.json({ error: 'Başvurular alınamadı.' }, { status: 500 });
  }
  return Response.json(data);
}

export async function POST(req) {
  const supabase = createAdminClient();
  const body = await req.json();
  const row = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    city: body.city,
    title: body.title,
    experience: body.experience,
    education: body.education,
    specialties: body.specialties || [],
    approaches: body.approaches || [],
    about: body.about,
    price: body.price,
    session_mode: body.sessionMode || [],
    diploma_url: body.diplomaUrl || null,
    diploma_file_name: body.diplomaFileName || null,
    video_url: body.videoUrl || null,
    video_file_name: body.videoFileName || null,
    video_file_size: body.videoFileSize || null,
    status: 'bekliyor',
  };
  const { data, error } = await supabase
    .from('applications')
    .insert([row])
    .select()
    .single();
  if (error) {
    console.error('applications POST error:', error);
    return Response.json({ error: 'Başvuru kaydedilemedi.' }, { status: 500 });
  }
  return Response.json(data, { status: 201 });
}
