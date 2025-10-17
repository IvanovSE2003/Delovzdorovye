import axios from 'axios';
import type { AuthResponse } from '../models/response/AuthResponse';

export const URL = 'http://localhost:5000';
export const API_URL = `${URL}/api`;

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// === Интерсептор запросов ===
$api.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// === Интерсептор ответов ===
$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._isRetry) {
            originalRequest._isRetry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                refreshPromise = axios
                    .get<AuthResponse>(`${API_URL}/user/refresh`, { withCredentials: true })
                    .then((res) => {
                        const newToken = res.data.accessToken;
                        localStorage.setItem('token', newToken);
                        return newToken;
                    })
                    .catch((err) => {
                        console.log('Не авторизован!');
                        localStorage.removeItem('token');
                        throw err;
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            }

            try {
                // 🕓 Ждём, пока токен обновится
                const newToken = await refreshPromise;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return $api(originalRequest);
            } catch (err) {
                throw err;
            }
        }

        throw error;
    }
);

export default $api;
