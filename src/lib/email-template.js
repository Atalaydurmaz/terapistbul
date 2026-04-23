// Shared HTML email template. Uses inline styles only — external CSS is
// stripped by Gmail, Outlook, Yahoo, etc. Text-based branded header works
// across every major email client; embedded SVG/PNG logos frequently get
// blocked by default until the user opts in.
//
// Usage:
//   renderEmail({
//     title: 'Randevunuz Onaylandı',
//     preheader: 'Mehmet Demir ile görüşmeniz hazır.',
//     accentIcon: '✅',
//     bodyHtml: '<p>...</p>',
//     ctaLabel: 'Görüşmeye Katıl',
//     ctaUrl: 'https://...',
//   });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://terapistibul.com';

const TEAL = '#0d9488';
const TEAL_DARK = '#0f766e';
const BLUE = '#1a56db';
const BLUE_LIGHT = '#60a5fa';
const TEXT = '#0f172a';
const SUBTEXT = '#64748b';
const BG = '#f1f5f9';
const CARD_BG = '#ffffff';
const BORDER = '#e2e8f0';

export function renderEmail({
  title,
  preheader = '',
  accentIcon = '',
  bodyHtml = '',
  ctaLabel = null,
  ctaUrl = null,
  footerNote = '',
} = {}) {
  const cta = ctaLabel && ctaUrl
    ? `
      <tr>
        <td style="padding:8px 32px 24px 32px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;">
            <tr>
              <td align="center">
                <a href="${ctaUrl}"
                   style="display:inline-block;padding:14px 32px;background:${TEAL};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;border-radius:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                  ${ctaLabel}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${TEXT};-webkit-font-smoothing:antialiased;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${BG};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;">
          <!-- Brand header -->
          <tr>
            <td align="center" style="padding:8px 0 20px 0;">
              <a href="${APP_URL}" style="text-decoration:none;display:inline-block;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:10px;">
                      <div style="width:40px;height:40px;border-radius:50%;background:#ffffff;border:2px solid ${BLUE};display:inline-block;line-height:36px;text-align:center;font-size:20px;">🤝</div>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                        <span style="color:${BLUE_LIGHT};">Terapist</span><span style="color:${TEAL};">Bul</span>
                      </span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.04);">
              <!-- Accent bar -->
              <div style="height:4px;background:linear-gradient(90deg,${TEAL} 0%,${BLUE_LIGHT} 100%);"></div>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding:32px 32px 8px 32px;">
                    ${accentIcon ? `<div style="font-size:40px;line-height:1;margin-bottom:12px;">${accentIcon}</div>` : ''}
                    <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:${TEXT};letter-spacing:-0.3px;">${title}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 24px 32px;font-size:15px;line-height:1.6;color:${TEXT};">
                    ${bodyHtml}
                  </td>
                </tr>
                ${cta}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 16px 8px 16px;text-align:center;font-size:12px;color:${SUBTEXT};line-height:1.6;">
              ${footerNote ? `<p style="margin:0 0 12px 0;">${footerNote}</p>` : ''}
              <p style="margin:0;">
                <a href="${APP_URL}" style="color:${TEAL};text-decoration:none;font-weight:500;">terapistibul.com</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/hesabim" style="color:${SUBTEXT};text-decoration:none;">Hesabım</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/destek" style="color:${SUBTEXT};text-decoration:none;">Destek</a>
              </p>
              <p style="margin:8px 0 0 0;color:#94a3b8;">© ${new Date().getFullYear()} TerapistBul. Tüm hakları saklıdır.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Küçük bir bilgi satırı (ikon + başlık + değer) — gövde HTML'i içinde kullanılır.
export function infoRow(icon, label, value) {
  if (!value) return '';
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:12px 0;">
      <tr>
        <td style="padding:12px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
          <span style="color:${SUBTEXT};font-size:13px;">${icon} ${label}</span>
          <br/>
          <strong style="color:${TEXT};font-size:15px;">${value}</strong>
        </td>
      </tr>
    </table>`;
}
