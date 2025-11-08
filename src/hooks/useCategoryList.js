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
    refetchInterval: 10000, // Poll every 10 seconds
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}
// template usage 
// const {data,isLoading,error,refetch}= useCategoryList(); 