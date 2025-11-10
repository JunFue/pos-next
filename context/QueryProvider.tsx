// QueryProvider.tsx (or directly in layout.tsx)
"use client"; // Must be a client component to use state/hooks

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // Optional but recommended

// Create a client instance
const queryClient = new QueryClient();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} /> {/* Optional dev tools */}
    </QueryClientProvider>
  );
}
