'use client';
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const TranstackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mutations already invalidate affected queries. A short freshness
            // window avoids duplicate requests as users move between screens.
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
