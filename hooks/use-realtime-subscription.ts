import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionProps<T> {
  table: string;
  initialData: T[];
  filter?: string;
  orderBy?: (a: T, b: T) => number;
}

export function useRealtimeSubscription<T extends { id: string }>({
  table,
  initialData,
  filter,
  orderBy,
}: UseRealtimeSubscriptionProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const supabase = createClient();

  useEffect(() => {
    // Update local state if initialData changes (e.g. re-fetch)
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          console.log('Realtime event received:', payload);

          if (payload.eventType === 'INSERT') {
            setData((currentData) => {
              const newData = [...currentData, payload.new as T];
              return orderBy ? newData.sort(orderBy) : newData;
            });
          } else if (payload.eventType === 'UPDATE') {
            setData((currentData) => {
              const newData = currentData.map((item) =>
                item.id === (payload.new as T).id ? (payload.new as T) : item
              );
              return orderBy ? newData.sort(orderBy) : newData;
            });
          } else if (payload.eventType === 'DELETE') {
            setData((currentData) =>
              currentData.filter((item) => item.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, orderBy, supabase]);

  return data;
}
