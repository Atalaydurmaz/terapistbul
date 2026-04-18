import { notFound } from 'next/navigation';
import { therapists as staticTherapists } from '../../../data/therapists';
import { createAdminClient } from '@/lib/supabase/admin';
import TerapistProfilClient from './TerapistProfilClient';

export const dynamic = 'force-dynamic';

async function getTherapist(id) {
  // Önce Supabase'den UUID ile ara
  try {
    const supabase = createAdminClient();
    const [{ data }, { data: profiles }] = await Promise.all([
      supabase.from('therapists').select('*').eq('id', id).maybeSingle(),
      supabase.from('therapist_profiles').select('panel_id, photo_url, intro_video_url, gallery_photos'),
    ]);
    if (data) {
      // Find matching profile via static data bridge
      const nameToProfile = {};
      if (profiles) {
        for (const p of profiles) {
          const staticT = staticTherapists.find((t) => t.id === p.panel_id);
          if (staticT) nameToProfile[staticT.name] = p;
        }
      }
      const prof = nameToProfile[data.name];
      const photoUrl = data.photo_url || prof?.photo_url || null;
      return {
        ...data,
        inPerson: data.in_person,
        reviewCount: data.review_count,
        photo: photoUrl,
        photo_url: photoUrl,
        intro_video_url: data.intro_video_url || prof?.intro_video_url || null,
        gallery_photos: data.gallery_photos || prof?.gallery_photos || [],
        initials: (data.name || '').split(' ').filter(w => /^[A-ZÇĞİÖŞÜ]/.test(w)).map(w => w[0]).slice(0, 2).join('') || '?',
        color: '#0d9488',
        aiTags: [],
        freeConsultation: false,
      };
    }
  } catch {}
  // Fallback: static data (eski string ID'ler için)
  return staticTherapists.find((t) => t.id === id) || null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const therapist = await getTherapist(id);
  if (!therapist) return {};
  return {
    title: `${therapist.name} — ${therapist.title}`,
    description: therapist.about,
  };
}

export default async function TerapistProfilPage({ params }) {
  const { id } = await params;
  const therapist = await getTherapist(id);

  if (!therapist) notFound();

  const others = staticTherapists
    .filter((t) => t.id !== id && t.specialties?.some((s) => therapist.specialties?.includes(s)))
    .slice(0, 3);

  return <TerapistProfilClient therapist={therapist} others={others} />;
}
