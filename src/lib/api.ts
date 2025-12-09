/* API Utility for Supabase Interaction via Fetch */

const SUPABASE_URL = 'https://ktfvfulefozcecmemqaj.supabase.co'
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZnZmdWxlZm96Y2VtcWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODEwNTAsImV4cCI6MjA4MDY1NzA1MH0.RFG4sQZ1w7-zJv0XLm1rYrfhpRz97D6AIw-vNPZnWY0'

interface FetchOptions extends RequestInit {
  token?: string
}

async function supabaseFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options

  const defaultHeaders: Record<string, string> = {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // Handle Range header for pagination if passed in options.headers
  // We merge passed headers with default headers
  const finalHeaders = {
    ...defaultHeaders,
    ...(headers as Record<string, string>),
  }

  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    headers: finalHeaders,
    ...rest,
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }))
    throw new Error(
      error.msg ||
        error.message ||
        error.error_description ||
        'API request failed',
    )
  }

  // Supabase returns 204 No Content for some updates
  if (response.status === 204) return {} as T

  return response.json()
}

export const api = {
  auth: {
    signIn: (email: string, password: string) =>
      supabaseFetch<any>('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    getUser: (token: string) => supabaseFetch<any>('/auth/v1/user', { token }),
  },
  db: {
    select: <T>(table: string, query: string = '', token: string) =>
      supabaseFetch<T[]>(`/rest/v1/${table}?${query}`, {
        token,
        method: 'GET',
      }),

    selectOne: <T>(table: string, query: string = '', token: string) =>
      supabaseFetch<T[]>(`/rest/v1/${table}?${query}`, {
        token,
        method: 'GET',
        headers: { Range: '0-0', Prefer: 'headers=return=representation' },
      }).then((res) => res[0]),

    insert: <T>(table: string, data: any, token: string) =>
      supabaseFetch<T>(`/rest/v1/${table}`, {
        token,
        method: 'POST',
        body: JSON.stringify(data),
        headers: { Prefer: 'return=representation' },
      }),

    update: <T>(table: string, id: string | number, data: any, token: string) =>
      supabaseFetch<T>(`/rest/v1/${table}?id=eq.${id}`, {
        token,
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { Prefer: 'return=representation' },
      }),
  },
}
