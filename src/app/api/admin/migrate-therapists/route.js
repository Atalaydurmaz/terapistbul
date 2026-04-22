import { createAdminClient } from '@/lib/supabase/admin';
import { therapists } from '@/data/therapists';

export async function POST() {
  const supabase = createAdminClient();

  // Already migrated?
  const { count } = await supabase.from('therapists').select('*', { count: 'exact', head: true });
  if (count > 0) {
    return Response.json({ message: `Zaten ${count} terapist var, migration atlandı.` });
  }

  const rows = therapists.map((t) => ({
    name: t.name,
    title: t.title,
    city: t.city,
    online: t.online || false,
    in_person: t.inPerson || false,
    price: t.price || 0,
    specialties: t.specialties || [],
    approaches: t.approaches || [],
    experience: t.experience || 0,
    education: t.education || '',
    about: t.about || '',
    rating: t.rating || 0,
    review_count: t.reviewCount || 0,
    verified: t.verified || false,
    status: 'aktif',
    email: t.email || '',
    phone: t.phone || '',
  }));

  const { data, error } = await supabase.from('therapists').insert(rows).select('id, name');
  if (error) { console.error(error); return Response.json({ error: 'Migration failed.' }, { status: 500 }); }

  return Response.json({ success: true, migrated: data.length, therapists: data });
}
