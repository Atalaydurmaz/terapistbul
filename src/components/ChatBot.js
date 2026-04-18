'use client';

import { useState, useRef, useEffect } from 'react';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Merhaba! 👋 Ben TerapistBul\'un yapay zeka destekli psikoloji asistanıyım. Ruh sağlığınızla ilgili sorularınızı yanıtlamak, bilgi vermek ve sizi doğru uzmanlara yönlendirmek için buradayım.\n\nNasıl yardımcı olabilirim? 💚',
};

const QUICK_PROMPTS = [
  'Kaygı ile nasıl başa çıkabilirim?',
  'İyi bir terapist nasıl seçerim?',
  'Uyku sorunum var, ne yapmalıyım?',
  'Motivasyonum düşük, neden?',
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-xs">🧠</span>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-xs">🧠</span>
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-teal-600 text-white rounded-br-none'
            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
        }`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [unread, setUnread] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // İlk ziyarette 2.5 sn sonra bubble göster, 10 sn boyunca göster
  useEffect(() => {
    const seen = sessionStorage.getItem('chatbot_bubble_seen');
    if (seen) return;
    const showTimer = setTimeout(() => setShowBubble(true), 2500);
    const hideTimer = setTimeout(() => {
      setShowBubble(false);
      sessionStorage.setItem('chatbot_bubble_seen', '1');
    }, 12500);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  const dismissBubble = () => {
    setShowBubble(false);
    setBubbleDismissed(true);
    sessionStorage.setItem('chatbot_bubble_seen', '1');
  };

  const openChat = () => {
    dismissBubble();
    setOpen(true);
  };

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    setInput('');
    setShowQuick(false);
    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Anthropic API: mesajlar user ile başlamalı, hoşgeldin mesajını (assistant) çıkar
      const apiMessages = newMessages.filter((m) => m.role !== 'system');
      const firstUserIdx = apiMessages.findIndex((m) => m.role === 'user');
      const trimmedMessages = firstUserIdx >= 0 ? apiMessages.slice(firstUserIdx) : apiMessages;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: trimmedMessages }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
        if (!open) setUnread((u) => u + 1);
      }
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '⚠️ Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setShowQuick(true);
    setInput('');
  };

  return (
    <>
      {/* Karşılama Bubble */}
      {showBubble && !open && (
        <div
          className="fixed bottom-24 right-6 z-50 max-w-[260px] animate-in"
          style={{ animation: 'slideUpFade 0.4s ease-out' }}
        >
          <div className="bg-white rounded-2xl rounded-br-none shadow-xl border border-teal-100 p-4 relative">
            {/* Kapat */}
            <button
              onClick={dismissBubble}
              className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-sm flex-shrink-0">
                🧠
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-none">Psikoloji Asistanı</p>
                <p className="text-xs text-teal-600 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  7/24 çevrimiçi
                </p>
              </div>
            </div>

            {/* Mesaj */}
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              👋 Merhaba! Ruh sağlığınızla ilgili sorularınız için buradayım. Size yardımcı olabilir miyim?
            </p>

            {/* CTA */}
            <button
              onClick={openChat}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              Sohbet Başlat 💬
            </button>

            {/* Üçgen ok */}
            <div className="absolute -bottom-2 right-5 w-4 h-2 overflow-hidden">
              <div className="w-3 h-3 bg-white border-r border-b border-teal-100 rotate-45 translate-x-0.5 -translate-y-1.5 shadow-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { dismissBubble(); setOpen(!open); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Psikoloji Asistanı"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Pulse ring when closed */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-teal-400 opacity-30 animate-ping pointer-events-none" />
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0">
              🧠
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none">Psikoloji Asistanı</p>
              <p className="text-teal-200 text-xs mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                7/24 Çevrimiçi · Yapay Zeka Destekli
              </p>
            </div>
            <button
              onClick={clearChat}
              className="text-teal-200 hover:text-white transition-colors p-1"
              title="Sohbeti Temizle"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
              </svg>
            </button>
          </div>

          {/* Disclaimer strip */}
          <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5">
            <p className="text-xs text-amber-700">
              ⚠️ Bu asistan bilgi amaçlıdır, klinik tanı koymaz.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {showQuick && messages.length <= 1 && (
            <div className="px-3 pb-2">
              <p className="text-xs text-slate-400 mb-2">Hızlı sorular:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full hover:bg-teal-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-100">
            <div className="flex items-end gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mesajınızı yazın..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 resize-none outline-none max-h-28"
                style={{ lineHeight: '1.5' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-slate-300 mt-1.5">
              Powered by Anthropic Claude
            </p>
          </div>
        </div>
      )}
    </>
  );
}
