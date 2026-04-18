import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

function getUsers() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'src', 'data', 'registered-users.json'), 'utf8'));
  } catch {
    return [];
  }
}

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
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        const users = getUsers();
        const user = users.find(
          (u) => u.email?.toLowerCase() === email?.toLowerCase() && u.password === password
        );
        if (user) {
          return { id: user.email, email: user.email, name: user.name };
        }
        return null;
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
