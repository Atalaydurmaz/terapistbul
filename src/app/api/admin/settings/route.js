import { createAdminClient } from '@/lib/supabase/admin';

const DEFAULTS = {
  site: {
    siteName: 'TerapistBul',
    siteDesc: 'Türkiye\'nin yapay zeka destekli terapist eşleştirme platformu.',
    contactEmail: 'info@terapistbul.com',
    phone: '+90 212 555 0100',
    address: 'Levent Mahallesi, Büyükdere Cad. No:123 Kat:5, Şişli / İstanbul',
  },
  seo: {
    titleTemplate: '%s | TerapistBul',
    robotsEnabled: true,
    sitemapEnabled: true,
    gaId: '',
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@terapistbul.com',
    fromName: 'TerapistBul',
  },
  security: {
    sessionTimeout: '60',
    maxAttempts: '5',
    ipWhitelist: '',
    maintenanceMode: false,
    twoFactor: true,
  },
};

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('site, seo, email, security, updated_at')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      // Tablo yoksa (migration henüz çalıştırılmamışsa) default dön.
      if (/relation .* does not exist/i.test(error.message || '')) {
        return Response.json({ ...DEFAULTS, updated_at: null, _notMigrated: true });
      }
      console.error('settings GET error:', error);
      return Response.json({ error: 'Ayarlar okunamadı.' }, { status: 500 });
    }

    // Kayıt yoksa default dön.
    if (!data) return Response.json({ ...DEFAULTS, updated_at: null });

    // Eksik alanları default ile merge et (şema genişlemeleri için güvenli).
    return Response.json({
      site: { ...DEFAULTS.site, ...(data.site || {}) },
      seo: { ...DEFAULTS.seo, ...(data.seo || {}) },
      email: { ...DEFAULTS.email, ...(data.email || {}) },
      security: { ...DEFAULTS.security, ...(data.security || {}) },
      updated_at: data.updated_at,
    });
  } catch (err) {
    console.error('settings GET exception:', err);
    return Response.json({ error: 'Ayarlar okunamadı.' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const payload = {
      id: 1,
      site: { ...DEFAULTS.site, ...(body.site || {}) },
      seo: { ...DEFAULTS.seo, ...(body.seo || {}) },
      email: { ...DEFAULTS.email, ...(body.email || {}) },
      security: { ...DEFAULTS.security, ...(body.security || {}) },
      updated_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' })
      .select('site, seo, email, security, updated_at')
      .maybeSingle();

    if (error) {
      if (/relation .* does not exist/i.test(error.message || '')) {
        return Response.json(
          { error: 'site_settings tablosu bulunamadı. Supabase\'te supabase-add-site-settings.sql çalıştırın.' },
          { status: 503 }
        );
      }
      console.error('settings PUT error:', error);
      return Response.json({ error: 'Ayarlar kaydedilemedi.' }, { status: 500 });
    }

    return Response.json({ success: true, ...data });
  } catch (err) {
    console.error('settings PUT exception:', err);
    return Response.json({ error: 'Ayarlar kaydedilemedi.' }, { status: 500 });
  }
}
