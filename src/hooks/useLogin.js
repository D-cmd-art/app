import { useMutation } from '@tanstack/react-query';
import {api} from "../utils/api";
export function useLogin(options) {
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    ...options
  });
}

export function useLogout(options) {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get('/auth/logout'); // server clears cookies
      return res?.data;

    },
    ...options
  });
}
