// lib/client/api.js
import axios from 'axios';
import { useUserStore } from './store/userStore';
import { jwtDecode } from 'jwt-decode';
import { getTokens, saveTokens, deleteTokens } from '../utils/tokenStorage';

const api = axios.create({
  baseURL: 'http://bhokexpress.com/api',
});

// ✅ Attach access token to requests
api.interceptors.request.use(async (config) => {
  const tokens = await getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  if (config._skipAuthInterceptor) {
    config._skipAuthInterceptor = true;
  }

  return config;
});

// ✅ Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const { setAccessToken, setUser, clear } = useUserStore.getState();

    if (originalRequest._skipAuthInterceptor) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = await getTokens();
        if (!tokens?.refreshToken) throw new Error('No refresh token');

        // ✅ Call mobile-friendly refresh endpoint
        const res = await axios.post(
          'http://bhokexpress.com/api/refresh/mobile',
          { refreshToken: tokens.refreshToken },
          { headers: { _skipAuthInterceptor: true } }
        );

        const newAccessToken = res.data.accessToken;
        if (!newAccessToken) throw new Error('No token returned');

        await saveTokens(newAccessToken, tokens.refreshToken);
        setAccessToken(newAccessToken);
        setUser(jwtDecode(newAccessToken));

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        await deleteTokens();
        clear();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export { api };