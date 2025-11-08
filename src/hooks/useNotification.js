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
    refetchInterval: 100000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    enabled: true,
  });
}