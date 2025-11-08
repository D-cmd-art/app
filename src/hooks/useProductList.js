// hooks/useProductList.js
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api'; // Make sure api is axios instance

const fetchProducts = async (category) => {
  const url = category && category !== 'All'
    ? `/product?category=${encodeURIComponent(category)}`
    : '/product';

  const response = await api.get(url);
  return response.data.products;
};

export function useProductList(category) {
  return useQuery({
    queryKey: ['productList', category],
    queryFn: () => fetchProducts(category),
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}
