import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(data && { "Content-Type": "application/json" }),
  };

  // Obtener el token del usuario autenticado with error handling for token refresh
  const auth = await import('firebase/auth');
  const { getAuth, onAuthStateChanged } = auth;
  const currentUser = getAuth().currentUser;
  let token: string | null = null;

  if (currentUser) {
    try {
      token = await currentUser.getIdToken(true); // true for force refresh
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Handle token refresh error (e.g., re-authentication, logout)
      // For simplicity, logging the error for now.  A more robust solution would be needed in production
    }

  }


  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }), 
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});