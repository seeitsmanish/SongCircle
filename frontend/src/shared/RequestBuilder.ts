declare global {
    interface Window {
        Clerk?: any;
    }
}

type RequestMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const RequestBuilder = async (url: string, method: RequestMethods | 'GET' = 'GET', body: Record<string, string> | null = null) => {

    const headers = new Headers({
        'Content-Type': 'application/json',
    })
    const clerk = window?.Clerk;
    const token = clerk ? await clerk.session.getToken() : null;
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    const options: RequestInit = {
        method,
        headers,
    }

    if (method !== 'GET' && body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Request failed');
    }
}