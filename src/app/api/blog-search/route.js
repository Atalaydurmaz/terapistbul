import Anthropic from '@anthropic-ai/sdk';
import { blogPosts } from '../../../data/blogPosts';
import { blogPostsExtra } from '../../../data/blogPosts2';
import { blogPostsExtra3 } from '../../../data/blogPosts3';
import { blogPostsExtra4 } from '../../../data/blogPosts4';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const allPosts = [...blogPosts, ...blogPostsExtra, ...blogPostsExtra3, ...blogPostsExtra4];

const postIndex = allPosts.map((p) => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  excerpt: p.excerpt?.slice(0, 120),
  tags: p.tags || [],
}));

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return Response.json({ error: 'Geçersiz arama sorgusu' }, { status: 400 });
    }

    const trimmedQuery = query.trim().slice(0, 200);

    const systemPrompt = `Sen TerapistBul platformunun blog arama asistanısın. Kullanıcının doğal dilde yazdığı arama sorgusunu anlayarak en alakalı blog yazılarını bulacaksın.

Kurallar:
- Kullanıcı farklı kelimeler, eş anlamlılar veya cümleler kullanabilir (örn. "kaygım var" → anksiyete, "mutsuzum" → depresyon, "uyuyamıyorum" → uyku sorunları)
- Semantik anlama göre eşleştir, sadece kelime eşleşmesi yapma
- En fazla 6 makale öner, en alakalıdan en az alakalıya sırala
- Alakalı makale yoksa boş dizi döndür
- Türkçe düşün

Yanıtı SADECE şu JSON formatında ver, başka hiçbir şey ekleme:
{"results":[{"slug":"makale-slug","reason":"kısa Türkçe açıklama (max 8 kelime)"}]}`;

    const userMessage = `Arama sorgusu: "${trimmedQuery}"

Mevcut blog yazıları (JSON):
${JSON.stringify(postIndex)}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const rawText = response.content[0]?.text || '{"results":[]}';

    let parsed;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      parsed = { results: [] };
    }

    const validSlugs = new Set(allPosts.map((p) => p.slug));
    const results = (parsed.results || [])
      .filter((r) => r?.slug && validSlugs.has(r.slug))
      .slice(0, 6)
      .map((r) => ({
        slug: r.slug,
        reason: r.reason || '',
        post: allPosts.find((p) => p.slug === r.slug),
      }));

    return Response.json({ results, query: trimmedQuery });
  } catch (error) {
    console.error('Blog search API error:', error?.status, error?.message);
    return Response.json({ error: 'Arama sırasında bir hata oluştu' }, { status: 500 });
  }
}
