import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('registered_at', { ascending: false });
  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data);
}

export async function POST(req) {
  const supabase = createAdminClient();
  const body = await req.json();
  // Check duplicate email
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('email', body.email)
    .maybeSingle();
  if (existing) return Response.json({ error: 'Bu e-posta zaten kayıtlı.' }, { status: 409 });

  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...body, status: 'aktif', registered_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) { console.error(error); return Response.json({ error: 'Sunucu hatası.' }, { status: 500 }); }
  return Response.json(data, { status: 201 });
}
