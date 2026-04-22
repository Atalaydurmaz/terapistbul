import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import { verifyPassword } from '@/lib/auth/password';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function upsertClient(user) {
  try {
    const supabase = getSupabase();
    // Daha önce kayıtlı mı kontrol et
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (!existing) {
      await supabase.from('clients').insert([{
        name: user.name || user.email,
        email: user.email,
        status: 'aktif',
        registered_at: new Date().toISOString(),
      }]);
    }
  } catch (e) {
    console.error('upsertClient error:', e);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: 'select_account' } },
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').toLowerCase().trim();
        const password = String(credentials?.password || '');
        if (!email || !password) return null;
        try {
          const supabase = getSupabase();
          const { data, error } = await supabase
            .from('clients')
            .select('id, name, email, password_hash, status')
            .eq('email', email)
            .maybeSingle();
          if (error || !data || !data.password_hash) return null;
          if (data.status && data.status !== 'aktif') return null;
          const ok = await verifyPassword(password, data.password_hash);
          if (!ok) return null;
          return { id: String(data.id), email: data.email, name: data.name || data.email };
        } catch (e) {
          console.error('authorize error:', e);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/giris',
  },
  callbacks: {
    async signIn({ user }) {
      // Her giriş yapan kullanıcıyı clients tablosuna kaydet (yoksa)
      if (user?.email) {
        await upsertClient(user);
      }
      return true;
    },
    async jwt({ token, user }) {
      // İlk girişte user nesnesi gelir — name ve email'i token'a yaz
      if (user) {
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        // name ve email'i token'dan session'a taşı (credentials + Google için)
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
  },
});
