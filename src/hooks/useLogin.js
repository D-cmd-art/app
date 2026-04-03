import { useMutation } from '@tanstack/react-query';
import { requestWithFallback } from "../utils/api";

export function useLogin(options) {
  return useMutation({
    mutationFn: async (data) => {
      const res = await requestWithFallback({
        method: 'POST',
        url: '/auth/login',
        data,
      });
      return res.data;
    },
    ...options,
  });
}

export function useLogout(options) {
  return useMutation({
    mutationFn: async () => {
      const res = await requestWithFallback({
        method: 'GET',
        url: '/auth/logout',
      });
      return res?.data;
    },
    ...options,
  });
}