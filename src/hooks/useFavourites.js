import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";

// ---------------------------
// Add favourite
export function useFavourites(options) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/favourites/add', data);
      return res.data;
    },
    onSuccess: () => {
      // ✅ Invalidate / refetch favourite queries after mutation
      queryClient.invalidateQueries(['favourites']);
      queryClient.invalidateQueries(['favouritesAll']);
    },
    ...options
  });
}

// ---------------------------
// Get favourites for a user
async function fetchFavouriteList(userId) {
  const res = await api.get('/favourites', { params: { userId } });
  return res.data.favourites;
}

export function useFavouritesList(userId) {
  return useQuery({
    queryKey: ["favourites", userId],
    queryFn: () => fetchFavouriteList(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 15, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false, // ✅ avoid aggressive polling
  });
}

// ---------------------------
// Get all favourites (products + restaurants)
async function fetchFavouriteListAll(userId) {
  const res = await api.get('/favourites/full', { params: { userId } });
  return res.data.favourites;
}

export function useFavouriteListAll(userId) {
  return useQuery({
    queryKey: ["favouritesAll", userId],
    queryFn: () => fetchFavouriteListAll(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false, // ✅ avoid aggressive polling
  });
}
