'use client';

import { useState } from 'react';
import { blogPosts } from '../../../data/blogPosts';
import { blogPostsExtra } from '../../../data/blogPosts2';
import { blogPostsExtra3 } from '../../../data/blogPosts3';
import { blogPostsExtra4 } from '../../../data/blogPosts4';

const allSitePosts = [
  ...blogPosts,
  ...blogPostsExtra,
  ...blogPostsExtra3,
  ...blogPostsExtra4,
].map((p) => ({
  id: p.id || p.slug,
  slug: p.slug,
  title: p.title,
  category: p.category || 'Genel',
  author: p.author || 'TerapistBul Editör',
  date: p.date || p.publishedAt || '—',
  readTime: p.readTime || p.readingTime || 5,
  status: 'yayında',
}));

const categories = ['Tümü', ...Array.from(new Set(allSitePosts.map((p) => p.category))).sort()];

const statusBadge = (s) => {
  if (s === 'yayında') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Yayında</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-400 border border-slate-600">Taslak</span>;
};

export default function AdminBlogPage() {
  const [categoryFilter, setCategoryFilter] = useState('Tümü');
  const [posts, setPosts] = useState(allSitePosts);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', category: categories[1] || 'Anksiyete', excerpt: '' });
  const [toast, setToast] = useState('');

  const filtered = posts.filter((p) => categoryFilter === 'Tümü' || p.category === categoryFilter);

  const totalPublished = posts.filter((p) => p.status === 'yayında').length;
  const totalDraft = posts.filter((p) => p.status !== 'yayında').length;

  const handleToggleStatus = (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'yayında' ? 'taslak' : 'yayında' } : p))
    );
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPost = (e) => {
    e.preventDefault();
    const post = {
      id: Date.now(),
      slug: newPost.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: newPost.title,
      category: newPost.category,
      author: 'Admin',
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
      readTime: 5,
      status: 'taslak',
    };
    setPosts((prev) => [post, ...prev]);
    setNewPost({ title: '', category: categories[1] || 'Anksiyete', excerpt: '' });
    setShowModal(false);
    setToast('Yazı başarıyla eklendi!');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-2xl text-sm z-50 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{posts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Toplam Yazı</p>
        </div>
        <div className="bg-slate-800/60 border border-green-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{totalPublished}</p>
          <p className="text-xs text-slate-500 mt-1">Yayında</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-600 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{totalDraft}</p>
          <p className="text-xs text-slate-500 mt-1">Taslak</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {categories.slice(0, 7).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  categoryFilter === c
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:bg-slate-700 border border-transparent'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yeni Yazı Ekle
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Başlık</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden sm:table-cell">Kategori</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden md:table-cell">Yazar</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden lg:table-cell">Tarih</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 hidden lg:table-cell">Okuma</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Durum</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm text-white font-medium line-clamp-1 max-w-xs">{p.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 hidden sm:block">/{p.slug}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-lg text-xs">{p.category}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden md:table-cell">{p.author}</td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden lg:table-cell">{p.date}</td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden lg:table-cell">{p.readTime} dk</td>
                  <td className="px-5 py-3">{statusBadge(p.status)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Düzenle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        className={`p-1.5 rounded-lg transition-colors ${p.status === 'yayında' ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10' : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10'}`}
                        title={p.status === 'yayında' ? 'Taslağa Al' : 'Yayınla'}
                      >
                        {p.status === 'yayında' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Sil">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">{filtered.length} yazı gösteriliyor</p>
        </div>
      </div>

      {/* Add Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
              <h2 className="font-bold text-white">Yeni Blog Yazısı Ekle</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddPost} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Başlık</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Yazı başlığını girin..."
                  className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Kategori</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost((p) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  {categories.slice(1).map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Özet</label>
                <textarea
                  rows={4}
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost((p) => ({ ...p, excerpt: e.target.value }))}
                  placeholder="Yazı özeti..."
                  className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  İptal
                </button>
                <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Taslak Olarak Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
