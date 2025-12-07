// hooks/useForgot.js
import { useMutation } from '@tanstack/react-query';
import {api} from "../utils/api";
export function useForgot(options) {
  return useMutation({
    mutationFn: async ({ email }) => {
      const res = await api.post(
        '/auth/forgot', // 👈 confirm backend route
        { email },
        { _skipAuthInterceptor: true } // 👈 skip token injection
      );
      return res.data;
    },
    ...options,
  });
}