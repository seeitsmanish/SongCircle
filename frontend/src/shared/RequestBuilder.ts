import axios, { AxiosRequestConfig } from "axios";

declare global {
    interface Window {
        Clerk?: any;
    }
}

type RequestMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export const RequestBuilder = async (
    url: string,
    method: RequestMethods = "GET",
    body: Record<string, any> | null = null
) => {
    const clerk = window?.Clerk;
    const token = clerk ? await clerk.session.getToken() : null;

    const config: AxiosRequestConfig = {
        url,
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (token) {
        config.headers!["Authorization"] = `Bearer ${token}`;
    }

    if (method !== "GET" && body) {
        config.data = body;
    }

    try {
        const response = await axios(config);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};
