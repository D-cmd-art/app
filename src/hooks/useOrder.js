import { useMutation,useQuery } from '@tanstack/react-query';
import {api} from "../utils/api";

export function useOrder(options) {
  return useMutation({
    mutationFn: async (data) => {  
      const res = await api.post('/orders/create', data); // ✅ corrected endpoint
      return res.data;
    },
    ...options,
  });
}


export function useUserOrders(userId) {
  return useQuery({
    queryKey: ["userOrders", userId],
    queryFn: async () => {
      if (!userId) return [];  // If no userId, return empty array
      const res = await api.get(`/orders/user/${userId}`);
      return res.data.orders;  // Return the orders directly
    },
    enabled: !!userId, //  only fetch if userId exists
  });
}
