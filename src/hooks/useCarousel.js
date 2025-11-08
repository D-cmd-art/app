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
    refetchInterval: 10000, // Poll every 10 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
    enabled:true
  });
}