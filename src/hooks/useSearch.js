// hooks/useSearch.js
import { useQuery } from "@tanstack/react-query";
import {api} from "../utils/api";

export function useSearch(query, type) {
  return useQuery({
    queryKey: ["search", type, query],
    queryFn: async () => {
      if (!query || !type) return [];
      const res = await api.get("/search", {
        params: { query, type },
      });
      return res.data;
    },
    enabled: !!query && !!type && query.length > 2, // optional: minimum 3 chars
    staleTime: 60 * 1000,
  });
}
