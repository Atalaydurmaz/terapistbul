import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts } from '../../../data/blogPosts';
import { blogPostsExtra } from '../../../data/blogPosts2';
import { blogPostsExtra3 } from '../../../data/blogPosts3';
import { blogPostsExtra4 } from '../../../data/blogPosts4';

const allPosts = [...blogPosts, ...blogPostsExtra, ...blogPostsExtra3, ...blogPostsExtra4];

export async function generateStaticParams() {
  return allPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

// Minimal markdown renderer (bold, headers, lists, tables, hr)
function renderContent(content) {
  const lines = content.trim().split('\n');
  const elements = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-slate-800 mt-8 mb-3 border-b border-slate-100 pb-2">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-base font-bold text-slate-700 mt-5 mb-2">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // HR
    if (line.trim() === '---') {
      elements.push(<hr key={key++} className="my-6 border-slate-100" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} className="border-l-4 border-teal-400 bg-teal-50 pl-4 py-2 pr-3 rounded-r-xl my-4 text-sm text-teal-800 italic">
          {line.slice(2)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Table
    if (line.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter((l) => !l.match(/^\|[-| ]+\|$/));
      elements.push(
        <div key={key++} className="overflow-x-auto my-5">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split('|').filter(Boolean).map((c) => c.trim());
                const Tag = ri === 0 ? 'th' : 'td';
                return (
                  <tr key={ri} className={ri === 0 ? 'bg-teal-50' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {cells.map((cell, ci) => (
                      <Tag key={ci} className={`border border-slate-200 px-3 py-2 text-left ${ri === 0 ? 'font-semibold text-teal-800' : 'text-slate-600'}`}>
                        {cell}
                      </Tag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 my-3 text-slate-600 text-sm">
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </ul>
      );
      continue;
    }

    // Checkmark list (✅)
    if (line.startsWith('✅') || line.startsWith('⚠️') || line.startsWith('❌')) {
      elements.push(
        <p key={key++} className="text-sm text-slate-600 my-1.5" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
      i++;
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside space-y-1 my-3 text-slate-600 text-sm">
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={key++} className="text-slate-600 text-sm leading-relaxed my-2"
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>') }} />
    );
    i++;
  }

  return elements;
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = allPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3);

  return (
    <div className="bg-[#f0fdfa] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-6 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Bloga Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article */}
          <article className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Cover header */}
            <div className="bg-gradient-to-br from-teal-50 to-green-50 px-8 py-10 border-b border-slate-100">
              <div className="text-6xl mb-5">{post.cover}</div>
              <span className="inline-block text-xs font-semibold bg-teal-100 text-teal-700 px-3 py-1 rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">
                {post.title}
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">{post.excerpt}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {new Date(post.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {post.readTime} dakika okuma
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              {renderContent(post.content)}

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Etiketler</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white text-center">
                <p className="font-bold mb-1">Profesyonel destek almak ister misiniz?</p>
                <p className="text-teal-100 text-sm mb-4">
                  Bu konuda uzman terapistleri TerapistBul&apos;da bulabilirsiniz.
                </p>
                <Link
                  href={`/terapistler?q=${encodeURIComponent(post.tags[0])}`}
                  className="inline-block bg-white text-teal-700 font-semibold px-5 py-2 rounded-full hover:bg-teal-50 transition-colors text-sm"
                >
                  Uzman Terapist Bul →
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Related */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Benzer Yazılar</h3>
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link key={r.slug} href={`/blog/${r.slug}`} className="flex gap-3 group">
                      <span className="text-2xl">{r.cover}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                          {r.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.readTime} dk</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All categories */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Kategoriler</h3>
              <div className="space-y-1.5">
                {['Anksiyete', 'Depresyon', 'Terapi Yöntemleri', 'İlişki & Aile', 'Çocuk & Ergen', 'Kariyer & Stres', 'Rehber'].map((cat) => (
                  <Link key={cat} href={`/blog?category=${encodeURIComponent(cat)}`}
                    className="flex items-center justify-between text-xs text-slate-600 hover:text-teal-600 py-1 transition-colors">
                    <span>{cat}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sticky CTA */}
            <div className="bg-teal-600 rounded-2xl p-5 text-white text-center">
              <div className="text-3xl mb-2">🧠</div>
              <p className="text-sm font-bold mb-1">Terapist Arıyor musunuz?</p>
              <p className="text-teal-200 text-xs mb-3">Yapay Zeka eşleştirme ile size özel uzman bulun</p>
              <Link href="/terapistler" className="block bg-white text-teal-700 font-semibold text-xs py-2 rounded-full hover:bg-teal-50 transition-colors">
                Hemen Bul
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
