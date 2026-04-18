'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Supabase Realtime hook — tablo değişince callback'i çağırır
 * @param {string} table - Supabase tablo adı
 * @param {Function} onchange - Değişiklik olduğunda çağrılacak fonksiyon
 */
export function useRealtimeTable(table, onchange) {
  const supabase = useRef(null);

  useEffect(() => {
    if (!supabase.current) {
      supabase.current = createClient();
    }

    const channel = supabase.current
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => onchange()
      )
      .subscribe();

    return () => {
      supabase.current?.removeChannel(channel);
    };
  }, [table, onchange]);
}
