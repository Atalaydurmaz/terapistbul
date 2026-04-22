import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// POST /api/panel/upload-video
// Body: JSON { panel_id, filename, contentType }
// Returns: { signedUrl, publicUrl }
export async function POST(req) {
  try {
    const { panel_id, filename, contentType } = await req.json();

    if (!panel_id) {
      return Response.json({ error: 'panel_id gerekli' }, { status: 400 });
    }
    if (!filename) {
      return Response.json({ error: 'filename gerekli' }, { status: 400 });
    }
    if (!contentType?.startsWith('video/')) {
      return Response.json({ error: 'Sadece video dosyaları kabul edilir' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Bucket yoksa oluştur (zaten varsa hatayı yoksay)
    const { error: bucketError } = await supabase.storage.createBucket('videos', {
      public: true,
      fileSizeLimit: 524288000, // 500MB
    });
    if (bucketError && !bucketError.message?.includes('already exists')) {
      console.error('createBucket error:', bucketError);
      // Bucket yoksa devam etme
      if (bucketError.message?.includes('not exist') || bucketError.message?.includes('resource')) {
        return Response.json({ error: 'Supabase "videos" bucket bulunamadı. Lütfen Supabase dashboard → Storage → New Bucket → "videos" (Public) oluşturun.' }, { status: 500 });
      }
    }

    const ext = (filename.split('.').pop() || 'mp4').toLowerCase();
    const fileName = `${panel_id}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUploadUrl(fileName);

    if (error) {
      console.error('createSignedUploadUrl error:', error);
      if (error.message?.includes('not exist') || error.message?.includes('resource')) {
        return Response.json({ error: 'Supabase "videos" bucket bulunamadı. Dashboard → Storage → New Bucket → "videos" (Public) oluşturun.' }, { status: 500 });
      }
      return Response.json({ error: 'Yükleme başarısız.' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    return Response.json({ signedUrl: data.signedUrl, publicUrl });
  } catch (err) {
    console.error('Upload route error:', err);
    return Response.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
