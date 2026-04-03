import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useUserStore } from './store/userStore';
import { getTokens, saveTokens, deleteTokens } from '../utils/tokenStorage';

const PRIMARY_API = 'http://bhokexpress.com';
const FALLBACK_API = 'https://food-woad-six.vercel.app/api';

const api = axios.create({ baseURL: PRIMARY_API, timeout: 5000 }); // 5s timeout

api.interceptors.request.use(async (config) => {
  if (!config._skipAuthInterceptor) {
    const tokens = await getTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
  }
  return config;
});

// Helper: request with fallback
export async function requestWithFallback(config) {
  try {
    console.log("➡️ Trying PRIMARY API:", PRIMARY_API + config.url);
    return await api(config);
  } catch (error) {
    console.error("❌ Primary API failed:", error.message || error.code);

    // Trigger fallback on timeout, network error, or specific status codes
    if (
      error.code === 'ECONNABORTED' || // timeout
      !error.response ||               // network error
      [403, 404, 429].includes(error.response?.status) // blocked / not found / rate limited
    ) {
      try {
        console.warn("↪️ Retrying with FALLBACK API:", FALLBACK_API + config.url);
        const tokens = await getTokens();
        const res = await axios({
          ...config,
          baseURL: FALLBACK_API,
          timeout: 5000,
          headers: {
            ...config.headers,
            Authorization: tokens?.accessToken ? `Bearer ${tokens.accessToken}` : undefined,
          },
        });
        api.defaults.baseURL = FALLBACK_API;
        console.log("✅ Fallback API succeeded");
        return res;
      } catch (fallbackError) {
        console.error("❌ Fallback API also failed:", fallbackError.message || fallbackError.code);
        throw fallbackError;
      }
    }

    throw error;
  }
}

export { api };