'use client';

import { useState, useEffect } from 'react';

const conversations = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    initials: 'AY',
    color: 'bg-blue-100 text-blue-700',
    lastMessage: 'Teşekkür ederim, görüşürüz.',
    time: '10:32',
    unread: 0,
    messages: [
      { from: 'them', text: 'Merhaba Nur Hanım, bugünkü seans için hazırım.', time: '10:00' },
      { from: 'me', text: 'Merhaba Ahmet Bey, harika! Birkaç dakika içinde başlayalım.', time: '10:01' },
      { from: 'them', text: 'Tabii, bekliyorum. Geçen haftaki egzersizleri düzenli yaptım.', time: '10:05' },
      { from: 'me', text: 'Bu çok güzel, ilerlemeniz beni memnun ediyor. Nasıl hissettiniz?', time: '10:06' },
      { from: 'them', text: 'Gerçekten fark hissettim, özellikle sabah rutinleri çok işe yaradı.', time: '10:15' },
      { from: 'me', text: 'Harika! Devam edelim bu tempoyla. Gelecek hafta görüşürüz.', time: '10:30' },
      { from: 'them', text: 'Teşekkür ederim, görüşürüz.', time: '10:32' },
    ],
  },
  {
    id: 2,
    name: 'Fatma Demir',
    initials: 'FD',
    color: 'bg-pink-100 text-pink-700',
    lastMessage: 'Randevumu erteleyebilir miyim?',
    time: '09:18',
    unread: 2,
    messages: [
      { from: 'them', text: 'Nur Hanım merhaba, küçük bir ricam olacak.', time: '09:10' },
      { from: 'me', text: 'Merhaba Fatma Hanım, buyurun.', time: '09:12' },
      { from: 'them', text: 'Yarınki randevumu erteleyebilir miyim? İş toplantım çıktı.', time: '09:15' },
      { from: 'them', text: 'Randevumu erteleyebilir miyim?', time: '09:18' },
    ],
  },
  {
    id: 3,
    name: 'Mehmet Kaya',
    initials: 'MK',
    color: 'bg-amber-100 text-amber-700',
    lastMessage: 'Önerdiğiniz kitabı aldım.',
    time: 'Dün',
    unread: 0,
    messages: [
      { from: 'me', text: 'Merhaba Mehmet Bey, geçen seansta bahsettiğimiz kitabı okuma şansınız oldu mu?', time: 'Dün 14:00' },
      { from: 'them', text: 'Evet, hemen sipariş ettim!', time: 'Dün 16:30' },
      { from: 'me', text: 'Harika, umarım faydalı olur. Okurken aklınıza gelenler olursa not alın.', time: 'Dün 16:35' },
      { from: 'them', text: 'Önerdiğiniz kitabı aldım.', time: 'Dün 18:00' },
    ],
  },
  {
    id: 4,
    name: 'Zeynep Şahin',
    initials: 'ZS',
    color: 'bg-red-100 text-red-700',
    lastMessage: 'Anlıyorum, tekrar yazarım.',
    time: 'Pzt',
    unread: 0,
    messages: [
      { from: 'them', text: 'Nur Hanım, bir sorunum var acaba şimdi müsait misiniz?', time: 'Pzt 11:00' },
      { from: 'me', text: 'Şu an seans devam ediyor, en kısa sürede yazacağım.', time: 'Pzt 12:30' },
      { from: 'them', text: 'Anlıyorum, tekrar yazarım.', time: 'Pzt 12:32' },
    ],
  },
  {
    id: 5,
    name: 'Elif Çelik',
    initials: 'EÇ',
    color: 'bg-green-100 text-green-700',
    lastMessage: 'Görüşmek için sabırsızlanıyorum.',
    time: 'Pzt',
    unread: 1,
    messages: [
      { from: 'them', text: 'Merhaba, ilk seansım için çok heyecanlıyım.', time: 'Pzt 09:00' },
      { from: 'me', text: 'Merhaba Elif Hanım, ben de seansımız için sabırsızlanıyorum!', time: 'Pzt 10:00' },
      { from: 'them', text: 'Görüşmek için sabırsızlanıyorum.', time: 'Pzt 10:05' },
    ],
  },
  {
    id: 6,
    name: 'Can Arslan',
    initials: 'CA',
    color: 'bg-violet-100 text-violet-700',
    lastMessage: 'Peki, not aldım.',
    time: 'Paz',
    unread: 0,
    messages: [
      { from: 'me', text: 'Can Bey, bu hafta kendinize ayırdığınız zaman nasıl geçti?', time: 'Paz 15:00' },
      { from: 'them', text: 'İdare etti, ama günlük yazma egzersizi gerçekten işe yaradı.', time: 'Paz 15:30' },
      { from: 'me', text: 'Bunu duymak çok güzel! Bu egzersizle devam edin lütfen.', time: 'Paz 15:32' },
      { from: 'them', text: 'Peki, not aldım.', time: 'Paz 15:35' },
    ],
  },
];

export default function MesajlarPage() {
  const [selectedConvId, setSelectedConvId] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [convList, setConvList] = useState(conversations);
  const [search, setSearch] = useState('');
  const [therapistInfo, setTherapistInfo] = useState({ name: '', email: '' });

  // Okundu bilgisini localStorage'dan uygula (hydration sonrası)
  useEffect(() => {
    setConvList((prev) => {
      const updated = prev.map((c) => {
        const readCount = Number(localStorage.getItem(`panel_read_${c.id}`) || 0);
        return { ...c, unread: Math.max(0, c.unread - readCount) };
      });
      const total = updated.reduce((sum, c) => sum + (c.unread || 0), 0);
      localStorage.setItem('panel_unread_messages', String(total));
      return updated;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = localStorage.getItem('panel_therapist_id');
    if (!id) return;
    try {
      const { therapists } = require('../../../data/therapists');
      const t = therapists.find((t) => t.id === id);
      if (!t) return;
      let name = t.name;
      const stored = localStorage.getItem(`panel_profil_${id}`);
      if (stored) {
        const s = JSON.parse(stored);
        if (s.formData?.adSoyad) name = s.formData.adSoyad;
      }
      const email = `${t.initials.toLowerCase()}@terapistbul.com`;
      setTherapistInfo({ name, email });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!therapistInfo.email) return;
    fetch('/api/panel/messages')
      .then((r) => r.json())
      .then((allMessages) => {
        // Filter messages for this therapist only
        const incoming = allMessages.filter(
          (m) => m.therapistEmail === therapistInfo.email
        );
        if (!incoming.length) return;
        // Group by sender email
        const grouped = {};
        incoming.forEach((m) => {
          const isTherapistReply = m.direction === 'therapist_to_user';
          const key = isTherapistReply ? (m.toEmail || m.toName) : (m.email || m.name);
          const senderName = isTherapistReply ? (m.toName || m.toEmail) : m.name;
          if (!grouped[key]) {
            grouped[key] = {
              id: `incoming-${key}`,
              name: senderName,
              initials: senderName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
              color: 'bg-teal-100 text-teal-700',
              email: isTherapistReply ? m.toEmail : m.email,
              phone: m.phone,
              messageIds: [],
              messages: [],
              unread: 0,
            };
          }
          grouped[key].messageIds.push(m.id);
          grouped[key].messages.push({
            from: isTherapistReply ? 'me' : 'them',
            text: m.note,
            time: new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            id: m.id,
          });
          if (!isTherapistReply) grouped[key].unread += 1;
        });
        const mapped = Object.values(grouped).map((g) => {
          const last = g.messages[g.messages.length - 1];
          const readCount = Number(localStorage.getItem(`panel_read_${g.id}`) || 0);
          const unread = Math.max(0, g.unread - readCount);
          return { ...g, lastMessage: last.text, time: last.time, unread };
        });
        // Mark first conversation as read
        if (mapped[0]) {
          localStorage.setItem(`panel_read_${mapped[0].id}`, mapped[0].messages.length);
          mapped[0].unread = 0;
        }
        setConvList((prev) => [...mapped, ...prev]);
        setSelectedConvId((cur) => cur ?? mapped[0]?.id);
      })
      .catch(() => {});
  }, [therapistInfo.email]);

  const selectedConv = convList.find((c) => c.id === selectedConvId);
  const filteredConvs = convList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (convId) => {
    if (String(convId).startsWith('incoming-')) {
      const conv = convList.find((c) => c.id === convId);
      const ids = conv?.messageIds || [];
      await Promise.all(ids.map((id) =>
        fetch(`/api/panel/messages/${id}`, { method: 'DELETE' }).catch(() => {})
      ));
    }
    const remaining = convList.filter((c) => c.id !== convId);
    setConvList(remaining);
    setSelectedConvId(remaining[0]?.id ?? null);
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;
    const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const newMsg = { from: 'me', text: messageText, time: now };
    setConvList(convList.map((c) =>
      c.id === selectedConvId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: messageText, time: now }
        : c
    ));
    // Save to DB if replying to a real incoming conversation
    const conv = convList.find((c) => c.id === selectedConvId);
    if (conv?.email && String(selectedConvId).startsWith('incoming-')) {
      fetch('/api/panel/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: messageText.trim(),
          toEmail: conv.email,
          toName: conv.name,
          therapistName: therapistInfo.name,
          therapistEmail: therapistInfo.email,
        }),
      }).catch(() => {});
    }
    setMessageText('');
  };

  const handleSelectConv = (id) => {
    setSelectedConvId(id);
    setConvList(convList.map((c) => {
      if (c.id === id) {
        localStorage.setItem(`panel_read_${id}`, c.messages.length);
        return { ...c, unread: 0 };
      }
      return c;
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[calc(100vh-10rem)] flex">
      {/* Left: conversation list */}
      <div className="w-72 xl:w-80 flex-shrink-0 border-r border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800">Mesajlar</h3>
            <button className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center hover:bg-teal-100 transition-colors" title="Yeni Konuşma">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredConvs.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConv(conv.id)}
              className={`w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors ${
                selectedConvId === conv.id ? 'bg-teal-50 border-r-2 border-teal-600' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${conv.color}`}>
                  {conv.initials}
                </div>
                {conv.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm font-medium ${conv.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                    {conv.name}
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{conv.time}</span>
                </div>
                <p className={`text-xs truncate ${conv.unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* New conversation button */}
        <div className="p-3 border-t border-slate-100">
          <button className="w-full py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors">
            Yeni Konuşma
          </button>
        </div>
      </div>

      {/* Right: chat area */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${selectedConv.color}`}>
              {selectedConv.initials}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{selectedConv.name}</p>
              {selectedConv.email ? (
                <p className="text-xs text-slate-400">{selectedConv.email}{selectedConv.phone ? ` · ${selectedConv.phone}` : ''}</p>
              ) : (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Çevrimiçi
                </p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {String(selectedConv.id).startsWith('incoming-') && (
                <button
                  onClick={() => handleDelete(selectedConv.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sil"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              )}
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {selectedConv.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${msg.from === 'me' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'me'
                      ? 'bg-teal-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-3">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Mesajınızı yazın..."
                  rows={1}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-slate-800"
                />
              </div>
              <button
                onClick={handleSend}
                className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors flex-shrink-0 shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Bir konuşma seçin
        </div>
      )}
    </div>
  );
}
