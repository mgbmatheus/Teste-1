import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

export function createHttpClient(baseURL: string, timeoutMs = 15000): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'iPax-Municipal-Planning/1.0',
    },
  });

  client.interceptors.response.use(undefined, async (error) => {
    const cfg = error.config as AxiosRequestConfig & { _retryCount?: number };
    const maxRetries = 3;
    cfg._retryCount = cfg._retryCount || 0;

    if (cfg._retryCount >= maxRetries) return Promise.reject(error);

    const status = error.response?.status;
    if (status && status < 500 && status !== 429) return Promise.reject(error);

    cfg._retryCount++;
    const delay = Math.pow(2, cfg._retryCount) * 1000;
    await new Promise((r) => setTimeout(r, delay));
    return client.request(cfg);
  });

  return client;
}
