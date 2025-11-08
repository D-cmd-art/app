// hooks/useRegister.js
import { useMutation } from '@tanstack/react-query';
import {api} from "../utils/api"
export function useRegister(options) {
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    ...options
  });
}
// various parameters like this 
// const { mutate, isLoading, error, isSuccess ,error,data} = useRegister();
//example of using it 
// 'use client';
// import { useRegister } from '@/hooks/useRegister';

// export default function RegisterForm() {
//   const { mutate, isLoading, error, isSuccess } = useRegister();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const data = {
//       username: 'bigyan',
//       password: 'securePassword123',
//     };
//     mutate(data);
//   };

