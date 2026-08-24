import axios from "axios";

// 1. Create the Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // Crucial for sending the Refresh Cookie
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 2. Helper to safely decode the JWT token payload
export function decodeJWT(token: string) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload: string;

    if (typeof window === "undefined") {
      jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    } else {
      jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
    }
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// 3. Helper to inject the Bearer token into every request
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    if (typeof window !== "undefined") localStorage.setItem("accessToken", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    if (typeof window !== "undefined") localStorage.removeItem("accessToken");
  }
}

// 4. Variables to handle multiple requests failing at the exact same time
let isRefreshing = false;
let failedQueue: Array<{ resolve: (val?: unknown) => void; reject: (err?: unknown) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 5. The Interceptor: Automatically catch 401s and refresh the token silently
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // STRIPPING HEADERS: Force Authorization to undefined
        // so the backend validates the HTTPOnly Refresh Cookie instead of the dead access token.
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            headers: { Authorization: undefined } 
          } 
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;

        if (newAccessToken) {
          setAuthToken(newAccessToken);
          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 💥 IF REFRESH FAILS, LOG THE EMPLOYER OUT AND REDIRECT TO LOGIN
        processQueue(refreshError, null);
        setAuthToken(null);

        if (typeof window !== "undefined") {
          // Clear all possible local storage keys to ensure a clean slate
          localStorage.removeItem("accessToken");
          localStorage.removeItem("mnj_token");
          localStorage.removeItem("mnj_session");
          
          // Redirect to the HR Panel's login page
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;