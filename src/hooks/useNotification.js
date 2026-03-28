// hooks/useNotifications.js
import { api } from '../utils/api'; 
import { useQuery } from '@tanstack/react-query';

async function fetchNotifications() {
  const res = await api.get('/notification');
  return res.data.notifications;
}

export function useNotificationsList() {
  return useQuery({
    queryKey: ['notification'],
    queryFn: fetchNotifications,
  
    refetchOnWindowFocus: false,     // only refetch when user focuses tab
    refetchOnReconnect: true,       // only when network reconnects
    refetchOnMount: false,   
           // don't refetch automatically on mount

    // ✅ Disable infinite polling
    enabled: true,
  });
}