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

  const auth = await import('firebase/auth');
  const { getAuth } = auth;
  const currentUser = getAuth().currentUser;

  if (!currentUser && url.includes('/api/favorites')) {
    throw new Error('Must be logged in to access favorites');
  }

  if (currentUser) {
    try {
      const token = await currentUser.getIdToken(true);
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error('Authentication failed. Please log in again.');
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
    const token = localStorage.getItem('token');
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
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