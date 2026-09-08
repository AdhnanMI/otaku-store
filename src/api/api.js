const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const isFormData = options.body instanceof FormData;

    let response;

    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {}),
            },
        });
    } catch (error) {
        const networkError = new Error(
            'Unable to connect to the server. Please check your internet connection and try again.'
        );

        networkError.status = 0;
        networkError.code = 'NETWORK_ERROR';

        throw networkError;
    }

    const contentType = response.headers.get('content-type') || '';

    const data = contentType.includes('application/json')
        ? await response.json()
        : {};

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
        }

        const error = new Error(data.error || 'API request failed');
        error.status = response.status;
        throw error;
    }
    return data;
}