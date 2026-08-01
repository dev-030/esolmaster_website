import axios from "axios";

const api = axios.create({
  baseURL: '/api', // This will be proxied to the backend as per next.config.ts
  withCredentials: true, // Include cookies in requests
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh token API itself returns 401
    if (originalRequest.url === '/auth/refresh_token') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh_token');
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
        // If refresh fails, they are truly logged out. Redirect to login.
        if (typeof window !== 'undefined') {
          localStorage.removeItem('role');
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { api as axios };
