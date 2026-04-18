import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req, { params }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { status } = await req.json();

  const { data: app, error: fetchErr } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });

  // If approved, create therapist profile
  if (status === 'onaylandi') {
    const { error: insertErr } = await supabase.from('therapists').insert([{
      application_id: app.id,
      name: app.name || '',
      title: app.title || 'Psikolog',
      city: app.city || '',
      specialties: app.specialties || [],
      approaches: app.approaches || [],
      experience: Number(app.experience) || 0,
      education: app.education || '',
      about: app.about || '',
      price: Number(app.price) || 0,
      email: app.email || '',
      phone: app.phone || '',
      online: true,
      in_person: false,
      status: 'aktif',
      rating: 0,
      review_count: 0,
      verified: false,
      diploma_url: app.diploma_url || null,
      video_url: app.video_url || null,
    }]);
    if (insertErr) console.error('Therapist insert error:', insertErr);
  }

  return Response.json(app);
}

export async function DELETE(req, { params }) {
  const supabase = createAdminClient();
  const { id } = await params;
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
