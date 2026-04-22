import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data);
}

export async function POST(req) {
  const supabase = createAdminClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ ...body, status: body.status || 'bekliyor' }])
    .select()
    .single();
  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data, { status: 201 });
}
