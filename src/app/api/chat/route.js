import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Sen TerapistBul platformunun yapay zeka destekli psikoloji asistanısın. Adın "Psikoloji Asistanı" ya da kısaca "Asistan".

Görevin:
- Kullanıcıların ruh sağlığı sorularını empatik, anlayışlı ve bilimsel temelli şekilde yanıtlamak
- Anksiyete, depresyon, stres, ilişki sorunları, uyku problemleri ve diğer psikolojik konularda bilgi vermek
- Uygun durumlarda TerapistBul platformundaki uzmanlara yönlendirmek
- Psikolojik test sonuçları hakkında açıklama yapmak
- 7/24 destek sağlamak

Önemli kurallar:
1. HİÇBİR ZAMAN klinik tanı koyma — "Bu durumunuz X bozukluğudur" deme
2. Ciddi kriz durumlarında (intihar düşüncesi, kendine zarar verme) mutlaka acil hatlara yönlendir: 182 ALO Psikiyatri Hattı, 182 veya 112
3. İlaç önerisi yapma
4. Samimi, sıcak ve yargısız bir dil kullan — kullanıcı kendini güvende hissetmeli
5. Türkçe konuş, anlaşılır ve sade bir dil kullan
6. Uzun monologlar yerine kısa, anlaşılır paragraflar kullan
7. Kullanıcı bir uzmana ihtiyaç duyduğunda TerapistBul'u öner: "TerapistBul'da alanında uzman terapistler bulabilirsiniz"
8. Empatik sorular sor — kullanıcının kendini ifade etmesine alan yarat
9. Psikoeğitim verirken bilimsel ama anlaşılır bir dil kullan
10. Konuşmayı kişiselleştir — kullanıcının paylaştıklarını hatırla ve referans ver

Sen bir arkadaş gibi yaklaşırken profesyonel sınırları koru. Kullanıcının terapisti değilsin ama onların yanında olan, anlayan ve yönlendiren bir destek noktasısın.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content[0]?.text || 'Üzgünüm, şu an yanıt veremiyorum.';

    return Response.json({ message: text });
  } catch (error) {
    console.error('Chat API error:', error?.status, error?.message, error?.error);
    if (error?.status === 401) {
      return Response.json({ error: 'API anahtarı geçersiz.' }, { status: 401 });
    }
    if (error?.status === 400) {
      return Response.json({ error: 'Mesaj formatı hatası: ' + (error?.message || '') }, { status: 400 });
    }
    return Response.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin.' }, { status: 500 });
  }
}
