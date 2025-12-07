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

// use orderlist
async function fetchOrderList(){
  const res=await api.get("/orders");
  return res.data.orders;
 }
 export function useOrderList() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrderList(),
    refetchInterval: 10000, 
    refetchIntervalInBackground: true, 
    staleTime: 0,
    refetchOnWindowFocus: true, 
    enabled: true,
  });
}

//  change the status of order based on the substatus
export function useSubStatus(options) {
  return useMutation({
    mutationFn: async ({ orderId, subStatus,products,userInfo,totalPayment,deliveryCharge }) => {
      if (!orderId) throw new Error("orderId is required");
      if (!subStatus) throw new Error("subStatus is required");

      //  Use PATCH to update existing order
      const res = await api.patch(`/orders/${orderId}`, { subStatus,products,userInfo,totalPayment,deliveryCharge });
      return res.data;
    },
    ...options,
  });
}
// use order based on user id 

// hooks/admin/useOrder.js



export function useUserOrders(userId) {
  return useQuery({
    queryKey: ["userOrders", userId],
    queryFn: async () => {
      if (!userId) return [];  // If no userId, return empty array
      const res = await api.get(`/orders/user/${userId}`);
      return res.data.orders;  // Return the orders directly
    },
    enabled: !!userId, // ✅ only fetch if userId exists
  });
}
