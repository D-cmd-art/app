// hooks/useRestaurantList.js

import { api } from "../utils/api";
import { useQuery } from "@tanstack/react-query";

// Fetch all restaurants
const fetchRestaurants = async () => {
  const res = await api.get('/restaurant');
  return res.data.restaurant;
};

export function useRestaurantList() {
  return useQuery({
    queryKey: ["restaurant"],
    queryFn: fetchRestaurants,
 // ✅ cache data
    staleTime: 1000 * 60 * 10, // 5 minutes

    // ✅ keep in memory
    cacheTime: 1000 * 60 * 30, // 30 minutes

    // ✅ refetch only on real events
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}

// Fetch restaurant products by ID
const fetchRestaurantProduct = async (restaurantId) => {
  const res = await api.get(`/restaurant/${restaurantId}`);
  return res.data;
};

export function useRestaurantProducts(id) {
  return useQuery({
    queryKey: ["restaurantProducts", id],
    queryFn: () => fetchRestaurantProduct(id),
    enabled: !!id,
  });
}
