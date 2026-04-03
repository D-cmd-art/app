import { useQuery } from '@tanstack/react-query';
import { requestWithFallback } from '../utils/api'; // ✅ use fallback-aware helper

// -------------------- FETCH NOTIFICATIONS --------------------
async function fetchNotifications() {
  const res = await requestWithFallback({
    method: 'GET',
    url: '/notification',
  });

  console.log("API response for /notification:", res?.data); // debug log

  // ✅ Always return an array, never undefined
  return res?.data?.notifications ?? [];
}

export function useNotificationsList() {
  return useQuery({
    queryKey: ['notification'],
    queryFn: fetchNotifications,

    // ✅ sensible defaults
    refetchOnWindowFocus: false, // only refetch when user focuses tab
    refetchOnReconnect: true,    // refetch when network reconnects
    refetchOnMount: false,       // don't refetch automatically on mount
    retry: false,                // no automatic retries
    staleTime: 1000 * 60 * 5,    // cache freshness: 5 minutes
    cacheTime: 1000 * 60 * 30,   // keep in memory: 30 minutes
  });
}