'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './client';
import { useState } from 'react';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
        gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer (formerly cacheTime)
        refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
        refetchOnMount: false, // Don't refetch on component mount if data exists
        retry: 1, // Only retry failed requests once
        retryDelay: 1000, // Wait 1 second before retrying
      },
    },
  }));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
