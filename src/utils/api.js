import axios from 'axios';
import { useUserStore } from './store/userStore';
import jwtDecode from 'jwt-decode';
import { getTokens, saveTokens, deleteTokens } from '../utils/tokenStorage';
import { Platform } from 'react-native';

const PRIMARY_API = 'http://bhokexpress.com/api';
const FALLBACK_API = 'https://food-woad-six.vercel.app/api';

const api = axios.create({
  baseURL: PRIMARY_API,
});

let requestCount = 0;

api.interceptors.request.use(async (config) => {
  requestCount += 1;

  console.log(
    `[Request #${requestCount}]`,
    config.method.toUpperCase(),
    config.url,
    'from',
    Platform.OS,
    'skipAuth:', !!config._skipAuthInterceptor
  );

  const tokens = await getTokens();

  if (tokens?.accessToken && !config._skipAuthInterceptor) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  return config;
});

// Response interceptor with token refresh & fallback
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const { setAccessToken, setUser, clear } = useUserStore.getState();

    // Skip interceptor flag
    if (originalRequest._skipAuthInterceptor) {
      return Promise.reject(error);
    }

    // Token refresh logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = await getTokens();
        if (!tokens?.refreshToken) throw new Error('No refresh token');

        const res = await axios.post(
          `${PRIMARY_API}/refresh/mobile`,
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

    // ❌ If error is network or blocked IP, try fallback API
    if (!error.response || error.response.status === 403 || error.response.status === 429) {
      try {
        console.warn('Primary API failed, trying fallback...');
        const fallbackResponse = await axios({
          ...originalRequest,
          baseURL: FALLBACK_API,
          _skipAuthInterceptor: true, // avoid retry loop
        });
        return fallbackResponse;
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }

    return Promise.reject(error);
  }
);

export { api };