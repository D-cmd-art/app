import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { setAccessToken } from '../utils/tokenStorage';
export function useForgot(options) {
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/auth/forgot', data);
     
      return res.data;
    },
    ...options
  });
}