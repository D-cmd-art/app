import { useQuery } from "@tanstack/react-query";
import {api} from "../utils/api"
//for getting the carousel 
const fetchCategories = async () => {
  const res = await api.get('/carousel');
  return res.data.carouselList;
};

export function useCarouselList() {
  return useQuery({
    queryKey: ['carousel'],
    queryFn: fetchCategories,
 // ✅ cache data
    staleTime: 1000 * 60 * 5, // 5 minutes

    // ✅ keep in memory
    cacheTime: 1000 * 60 * 30, // 30 minutes

    // ✅ refetch only on real events
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}