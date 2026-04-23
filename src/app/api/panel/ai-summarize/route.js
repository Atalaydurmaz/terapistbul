import Anthropic from '@anthropic-ai/sdk';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySession, SESSION_COOKIES } from '@/lib/auth/session';

/**
 * POST /api/panel/ai-summarize
 * body: { appointmentId: UUID, raw_text: string }
 *
 * Güvenlik:
 *   - Sadece panel cookie'si olan ve randevunun sahibi olan terapist kullanabilir.
 *   - Gizlilik: AI modeline gönderilen metindeki olası kişisel ad/soyad'ları
 *     "[Danışan]" ve "[Terapist]" olarak maskeliyoruz. Ek olarak randevudaki
 *     name ve therapist_name alanlarına özel maskeleme yapılıyor.
 *
 * Çıktı: { ai_summary: string, noteId: UUID, model: string }
 */

const MODEL = process.env.AI_SUMMARY_MODEL || 'claude-opus-4-5';

/**
 * İKİLİ ÇIKTI:
 *  A) KLİNİK SOAP NOTU  — yalnızca terapist için; teknik dil.
 *  B) DANIŞAN ÖZETİ     — danışana gösterilebilecek; destekleyici, cesaretlendirici,
 *     ev ödevi ve kişisel gelişim odaklı; klinik terminoloji YOK.
 *
 * Model tek çağrıda her iki çıktıyı da üretir; aralarındaki ayraç:
 *   ===SOAP===   ... klinik içerik ...   ===END_SOAP===
 *   ===CLIENT=== ... danışan içeriği ... ===END_CLIENT===
 */
const SYSTEM_PROMPT = `Sen iki farklı çıktı üreten uzman bir klinik asistanısın:

(A) KLİNİK SOAP NOTU — sadece terapistin göreceği, psikiyatri/psikoterapi pratiğinde kullanılan yapılandırılmış seans notu. Türkçe, mesleki dil.
(B) DANIŞAN ÖZETİ — danışana gösterilebilecek, destekleyici ve cesaretlendirici bir özet. Klinik terminoloji KULLANMA (ör. "patoloji", "belirti kümesi", "tanı", "bozukluk" vb. geçmesin). Günlük, sıcak ve umut veren Türkçe. Ev ödevi, küçük adımlar, kişisel gelişim vurgusu.

Her iki çıktıda da:
- Girdideki "[DANISAN]" / "[TERAPIST]" etiketlerini olduğu gibi bırak; gerçek isim uydurma.
- Girdide olmayan bilgi uydurma.
- Kesin klinik tanı koyma.

ÇIKTI FORMATI — birebir şu ayraçları kullan, başka hiçbir şey yazma:

===SOAP===
S (Subjective — Danışanın öznel ifadeleri)
...
O (Objective — Gözlenen davranış, ifade, duygulanım)
...
A (Assessment — Değerlendirme / izlenim; kesin tanı yok)
...
P (Plan — Bir sonraki seans için plan, ev ödevi, takip)
...
ÖZET: 2–3 cümlelik kısa genel özet
RİSK NOTU: intihar/kendine zarar/şiddet belirtisi varsa kısa uyarı, yoksa "Belirgin risk ifadesi tespit edilmedi."
===END_SOAP===

===CLIENT===
Merhaba, bu seansta birlikte ele aldıklarımızın kısa bir özetini paylaşıyorum:

• Bu seansta konuştuklarımız (2–4 madde, günlük dil)
• Fark ettiğin / birlikte fark ettiğimiz şeyler (destekleyici ton)
• Bir sonraki seansa kadar deneyebileceğin küçük adımlar / ev ödevi (2–3 somut öneri)
• Kendine nazik olman için kısa bir hatırlatma

Not: Bu özet klinik bir değerlendirme değildir; seansımızın destekleyici bir hatırlatıcısıdır.
===END_CLIENT===`;

function parseDualOutput(text) {
  const out = { soap: '', client: '' };
  if (!text) return out;
  const soapMatch = text.match(/===SOAP===([\s\S]*?)===END_SOAP===/i);
  const clientMatch = text.match(/===CLIENT===([\s\S]*?)===END_CLIENT===/i);
  if (soapMatch) out.soap = soapMatch[1].trim();
  if (clientMatch) out.client = clientMatch[1].trim();
  // Fallback: eğer ayraçlar yoksa hepsini SOAP'a koy, client boş kalır
  if (!out.soap && !out.client) out.soap = text.trim();
  return out;
}

const REDACT_PLACEHOLDER_CLIENT = '[DANISAN]';
const REDACT_PLACEHOLDER_THERAPIST = '[TERAPIST]';

/**
 * Basit isim/telefon/email/tc maskeleme + bilinen ad/soyadların kaldırılması.
 * Bu maskeleme "AI loglarına kişisel ad gitmesin" hedefini karşılar; mükemmel
 * PII tespiti değildir.
 */
function redactPii(text, { clientName, therapistName } = {}) {
  if (!text) return '';
  let out = String(text);

  // Email
  out = out.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '[EPOSTA]');
  // Telefon (TR formatları)
  out = out.replace(/(\+?90[\s-]?)?0?\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '[TELEFON]');
  // TCKN (11 haneli)
  out = out.replace(/\b\d{11}\b/g, '[TCKN]');
  // IBAN
  out = out.replace(/TR\d{2}[\s\d]{20,32}/gi, '[IBAN]');

  // Randevudaki isimler — her ismin her kelimesini (ve sadece baş harfi büyük
  // olanları) maskele. Kısa isimlerde false-positive olmaması için min 3 harf.
  const mask = (raw, placeholder) => {
    if (!raw) return;
    const parts = String(raw).split(/\s+/).filter((w) => w.length >= 3);
    for (const w of parts) {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      out = out.replace(re, placeholder);
    }
  };
  mask(clientName, REDACT_PLACEHOLDER_CLIENT);
  mask(therapistName, REDACT_PLACEHOLDER_THERAPIST);

  return out;
}

async function getTherapistViewer() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIES.PANEL)?.value;
  if (!token) return null;
  const payload = await verifySession(token).catch(() => null);
  if (!payload || payload.role !== 'therapist') return null;
  return {
    email: payload.email?.toLowerCase() || null,
    panelId: payload.panelId || payload.id || null,
  };
}

function isUuid(s) {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export async function POST(req) {
  try {
    const viewer = await getTherapistViewer();
    if (!viewer) return Response.json({ error: 'Yetkisiz' }, { status: 401 });

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ error: 'AI yapılandırılmamış' }, { status: 500 });
    }

    const { appointmentId, raw_text } = await req.json().catch(() => ({}));
    if (!isUuid(appointmentId)) return Response.json({ error: 'Geçersiz randevu' }, { status: 400 });
    if (!raw_text || typeof raw_text !== 'string' || raw_text.trim().length < 10) {
      return Response.json({ error: 'Not metni çok kısa' }, { status: 400 });
    }
    if (raw_text.length > 12000) {
      return Response.json({ error: 'Not metni çok uzun (maks 12000 karakter)' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: apt, error: aptErr } = await supabase
      .from('appointments')
      .select('id, name, therapist_name, therapist_email, status')
      .eq('id', appointmentId)
      .maybeSingle();
    if (aptErr) return Response.json({ error: aptErr.message }, { status: 500 });
    if (!apt) return Response.json({ error: 'Randevu bulunamadı' }, { status: 404 });

    // Sahiplik: randevunun therapist_email'i panel e-postasına eşit olmalı.
    // Eğer randevuda therapist_email yoksa (eski kayıtlar), panel cookie'sindeki
    // kimliği kabul ediyoruz (terapist paneline zaten middleware ile erişmiş).
    if (apt.therapist_email && viewer.email) {
      if (apt.therapist_email.toLowerCase() !== viewer.email) {
        return Response.json({ error: 'Yetkisiz (randevu sahibi değilsiniz)' }, { status: 403 });
      }
    }

    // AI'ya gönderilecek metni anonimleştir
    const redacted = redactPii(raw_text, {
      clientName: apt.name,
      therapistName: apt.therapist_name,
    });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userPrompt = `Aşağıdaki hızlı seans notlarından iki çıktıyı da üret:
(A) Klinik SOAP notu (terapist için)
(B) Danışan dostu destekleyici özet (danışana gösterilebilir)

"[DANISAN]" ve "[TERAPIST]" etiketlerini olduğu gibi bırak, gerçek isim uydurma.

Girdi:
---
${redacted}
---

Yanıtında başka hiçbir metin olmasın — sadece sistem promptunda belirtilen ===SOAP=== ... ===END_SOAP=== ve ===CLIENT=== ... ===END_CLIENT=== blokları olsun.`;

    let aiText = '';
    try {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });
      aiText = resp.content?.[0]?.text || '';
    } catch (e) {
      console.error('AI summary error:', e);
      return Response.json({ error: 'AI özet alınamadı' }, { status: 502 });
    }

    if (!aiText.trim()) {
      return Response.json({ error: 'AI boş yanıt döndü' }, { status: 502 });
    }

    const { soap: soapText, client: clientText } = parseDualOutput(aiText);

    // Draft olarak session_notes'a kaydet (her çağrıda yeni satır değil — aynı
    // randevu için son "draft" kaydı varsa onu güncelle, yoksa oluştur).
    const therapistIdForRow = viewer.panelId || viewer.email || 'unknown';
    const nowIso = new Date().toISOString();

    const { data: existing } = await supabase
      .from('session_notes')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('therapist_id', therapistIdForRow)
      .in('status', ['draft'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let noteId;
    if (existing?.id) {
      await supabase
        .from('session_notes')
        .update({
          raw_text,
          ai_summary: soapText,
          client_summary: clientText,
          model: MODEL,
          updated_at: nowIso,
        })
        .eq('id', existing.id);
      noteId = existing.id;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from('session_notes')
        .insert([{
          appointment_id: appointmentId,
          therapist_id: therapistIdForRow,
          therapist_email: viewer.email || null,
          raw_text,
          ai_summary: soapText,
          client_summary: clientText,
          status: 'draft',
          model: MODEL,
        }])
        .select('id')
        .single();
      if (insErr) return Response.json({ error: insErr.message }, { status: 500 });
      noteId = inserted.id;
    }

    return Response.json({
      ai_summary: soapText,
      client_summary: clientText,
      noteId,
      model: MODEL,
    });
  } catch (err) {
    console.error('ai-summarize error:', err);
    return Response.json({ error: err?.message || 'Hata' }, { status: 500 });
  }
}
