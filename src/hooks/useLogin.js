// hooks/useLogin.js
import { useMutation } from '@tanstack/react-query';
import {api} from '../utils/api';

export function useLogin(options) {
  return useMutation({
    mutationFn: async (data) => {
      console.log("data from loginnnnnn",data);
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    ...options,
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
