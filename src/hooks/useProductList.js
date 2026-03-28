// hooks/useProductList.js
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const PRODUCT_SESSION_KEY_PREFIX = 'product_list_';

// -------------------- FETCH PRODUCTS --------------------
const fetchProducts = async (category) => {
  const url =
    category && category !== 'All'
      ? `/product?category=${encodeURIComponent(category)}`
      : '/product';

  const response = await api.get(url);
  return response.data.products;
};

export function useProductList(category) {
  return useQuery({
    queryKey: ['productList', category],
    queryFn: async () => {
      const sessionKey = `${PRODUCT_SESSION_KEY_PREFIX}${category || 'All'}`;
      const session = await AsyncStorage.getItem(sessionKey);

      if (session) {
        const { data, timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < SESSION_DURATION) {
          // Return cached data if still valid
          return data;
        }
      }

      // Fetch fresh data
      const data = await fetchProducts(category);

      // Store in AsyncStorage with timestamp
      await AsyncStorage.setItem(
        sessionKey,
        JSON.stringify({ data, timestamp: Date.now() })
      );

      return data;
    },
    staleTime: SESSION_DURATION,      // session freshness
    cacheTime: SESSION_DURATION,      // keep in memory for 2 hours
    refetchOnWindowFocus: false,      // prevent extra calls
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  });
}
