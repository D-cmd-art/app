import { useMutation } from '@tanstack/react-query';
import {api} from '../utils/api';

export function useDeleteUser(options) {
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.post('/auth/user/delete', { id });
      return res.data;
    },
    ...options
  });
}
// edit the user information 
export function useEditUser(options) {
  return useMutation({
    mutationFn: async (updatedData) => {
      const res = await api.put('/auth/user/edit', updatedData);
    
      return res.data;
    },
    ...options
  });
}
//edit the userpassword
export function useEditPassword(options) {
  return useMutation({
    mutationFn: async ({ id, oldPassword, newPassword }) => {
      const res = await api.put('/auth/user/password/edit', {
        id,
        oldPassword,
        newPassword
      });
     
      return res.data;
    },
    ...options
  });
}


