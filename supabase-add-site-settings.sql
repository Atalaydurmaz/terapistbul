-- Single-row site settings (admin panel "Ayarlar")
-- Her ayar JSONB kolonunda tutulur, tek satır singleton.

create table if not exists site_settings (
  id int primary key default 1,
  site jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  email jsonb not null default '{}'::jsonb,
  security jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- İlk değerleri UI default'larıyla hizala (opsiyonel, istersen atla)
update site_settings set
  site = coalesce(site, '{}'::jsonb) || jsonb_build_object(
    'siteName', 'TerapistBul',
    'siteDesc', 'Türkiye''nin yapay zeka destekli terapist eşleştirme platformu.',
    'contactEmail', 'info@terapistbul.com',
    'phone', '+90 212 555 0100',
    'address', 'Levent Mahallesi, Büyükdere Cad. No:123 Kat:5, Şişli / İstanbul'
  ),
  seo = coalesce(seo, '{}'::jsonb) || jsonb_build_object(
    'titleTemplate', '%s | TerapistBul',
    'robotsEnabled', true,
    'sitemapEnabled', true,
    'gaId', ''
  ),
  email = coalesce(email, '{}'::jsonb) || jsonb_build_object(
    'smtpHost', 'smtp.gmail.com',
    'smtpPort', '587',
    'smtpUser', 'noreply@terapistbul.com',
    'fromName', 'TerapistBul'
  ),
  security = coalesce(security, '{}'::jsonb) || jsonb_build_object(
    'sessionTimeout', '60',
    'maxAttempts', '5',
    'ipWhitelist', '',
    'maintenanceMode', false,
    'twoFactor', true
  )
where id = 1;
