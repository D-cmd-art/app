
import {api} from "../utils/api";
import {useQuery} from "@tanstack/react-query";
// hooks/get restaurant all 
const fetchRestaurants = async () => {
  const res = await api.get('/restaurant');
  return res.data.restaurant;
};
export function useRestaurantList(options){
   return useQuery(
    {
    queryKey:["restaurant"],
    queryFn:fetchRestaurants,
    refetchInterval: 10000, // Poll every 10 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
    }
   )
}
// restaurant product
const fetchRestaurantProduct = async (restaurantName) => {
  if (!restaurantName) throw new Error("Restaurant name is required");
  const res = await api.get(`/restaurant/${restaurantName}`);
  return res.data;
};

export function useRestaurantProducts(name) {
  return useQuery({
    queryKey: ["restaurant", name],
    queryFn: async ({ queryKey }) => {
      const restaurantName = queryKey[1];
      return fetchRestaurantProduct(restaurantName);
    },
    enabled: !!name,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}
