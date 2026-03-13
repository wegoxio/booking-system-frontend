const API_URL = process.env.NEXT_PUBLIC_API_URL;

if(!API_URL){
    throw new Error("Falta NEXT_PUBLIC_API_URL en las variables de entorno")
}

type RequestOptions = RequestInit & {
    token?: string;
}

export async function apiFetch<t>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<t>{
    const {token, headers, ...restOptions} = options;
    const isFormData = typeof FormData !== "undefined" && restOptions.body instanceof FormData;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...restOptions,
        headers: {
            ...(isFormData ? {} : {"Content-Type": "application/json"}),
            ...(token ? {Authorization: `Bearer ${token}`}: {}),
            ...headers
        },
    });

    if(!response.ok){
        const errorData = await response.json().catch(()=>null);
        const message = Array.isArray(errorData?.message)
            ? errorData.message.join(", ")
            : errorData?.message;

        throw new Error(
            message || `Error ${response.status}: ${response.statusText}`
        );
    }

    if (response.status === 204) {
        return undefined as t;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json();
    }

    return response.text() as t;
}
