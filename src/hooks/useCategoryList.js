import {api} from '../utils/api';
import {useQuery} from "@tanstack/react-query";

// hooks for getting the api categories here 
const fetchCategories = async () => {
  const res = await api.get('/category');
  return res.data.categories;
};

export function useCategoryList() {
  return useQuery({
    queryKey: ['categories'],
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
// template usage 
// const {data,isLoading,error,refetch}= useCategoryList(); 