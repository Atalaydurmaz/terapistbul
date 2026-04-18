import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req) {
  const supabase = createAdminClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      name: body.name,
      email: body.email,
      note: body.note,
      therapist_name: body.therapistName || body.toName,
      therapist_email: body.therapistEmail,
      type: 'mesaj',
      status: null,
    }])
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
