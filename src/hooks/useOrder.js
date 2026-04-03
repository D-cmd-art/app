import { useMutation, useQuery } from '@tanstack/react-query';
import { requestWithFallback } from "../utils/api"; // ✅ use fallback-aware helper

// -------------------- CREATE ORDER --------------------
export function useOrder(options) {
  return useMutation({
    mutationFn: async (data) => {
      const res = await requestWithFallback({
        method: 'POST',
        url: '/orders/create',
        data,
      });
      return res?.data ?? {};
    },
    ...options,
  });
}

// -------------------- FETCH ORDER LIST --------------------
async function fetchOrderList() {
  const res = await requestWithFallback({
    method: 'GET',
    url: '/orders',
  });
  console.log("API response for /orders:", res?.data);
  return res?.data?.orders ?? [];
}

export function useOrderList() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrderList,
    staleTime: 1000 * 60 * 5,   // 5 minutes
    cacheTime: 1000 * 60 * 30,  // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}

// -------------------- UPDATE ORDER SUBSTATUS --------------------
export function useSubStatus(options) {
  return useMutation({
    mutationFn: async ({ orderId, subStatus, products, userInfo, totalPayment, deliveryCharge }) => {
      if (!orderId) throw new Error("orderId is required");
      if (!subStatus) throw new Error("subStatus is required");

      const res = await requestWithFallback({
        method: 'PATCH',
        url: `/orders/${orderId}`,
        data: { subStatus, products, userInfo, totalPayment, deliveryCharge },
      });
      return res?.data ?? {};
    },
    ...options,
  });
}

// -------------------- FETCH ORDERS BY USER --------------------
export function useUserOrders(userId) {
  return useQuery({
    queryKey: ["userOrders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await requestWithFallback({
        method: 'GET',
        url: `/orders/user/${userId}`,
      });
      console.log(`API response for /orders/user/${userId}:`, res?.data);
      return res?.data?.orders ?? [];
    },
    enabled: !!userId,
  });
}