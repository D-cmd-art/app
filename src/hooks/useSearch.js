import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query"; // ✅ make sure this is imported
import { api } from "../utils/api";
export function useSearch(rawQuery, type) {
  const [query] = useDebounce(rawQuery, 500);

  console.log("Search hook running:", query, type);

  return useQuery({
    queryKey: ["search", type, query],
    queryFn: async () => {
      console.log("Fetching API...", query, type);
      if (!query || !type) return [];

      const res = await api.get("/search", {
        params: { query, type },
      });

      console.log("API result:", res.data);
      return res.data;
    },
    enabled: !!query && !!type,
     // ✅ cache data
    staleTime: 1000 * 60 * 30, // 30 minutes

    // ✅ keep in memory
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
        // ✅ refetch only on real events
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}
