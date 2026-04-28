import axios from 'axios'
import { getToken, removeToken } from './storage'

const baseURL = import.meta.env.DEV
    ? '/api'
    : import.meta.env.VITE_API_BASE_URL

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeToken()

            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api