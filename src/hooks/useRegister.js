import { useMutation } from '@tanstack/react-query';
import { requestWithFallback } from "../utils/api"; // use the fallback-aware helper

export function useRegister(options) {
  return useMutation({
    mutationFn: async (data) => {
      const res = await requestWithFallback({
        method: 'POST',
        url: '/auth/register',
        data,
      });
      return res.data;
    },
    ...options,
  });
}