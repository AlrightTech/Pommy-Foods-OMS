/**
 * API Client utility for making authenticated requests
 * Handles authentication, error handling, and response parsing
 */

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: any
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/**
 * Make an authenticated API request
 * Cookies are automatically sent with same-origin requests in Next.js
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, params } = options

  // Build URL with query parameters
  const url = new URL(endpoint, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value))
      }
    })
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Include cookies for authentication
  }

  // Add body if present
  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url.toString(), requestOptions)

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      if (!response.ok) {
        throw new ApiError(
          `Request failed with status ${response.status}`,
          response.status
        )
      }
      return (await response.text()) as T
    }

    const data = await response.json()

    // Handle error responses
    if (!response.ok) {
      throw new ApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiError("Network error. Please check your connection.", 0)
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred",
      0
    )
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T>(endpoint: string, params?: RequestOptions["params"]) =>
    apiRequest<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: any, params?: RequestOptions["params"]) =>
    apiRequest<T>(endpoint, { method: "POST", body, params }),

  put: <T>(endpoint: string, body?: any, params?: RequestOptions["params"]) =>
    apiRequest<T>(endpoint, { method: "PUT", body, params }),

  delete: <T>(endpoint: string, params?: RequestOptions["params"]) =>
    apiRequest<T>(endpoint, { method: "DELETE", params }),

  patch: <T>(endpoint: string, body?: any, params?: RequestOptions["params"]) =>
    apiRequest<T>(endpoint, { method: "PATCH", body, params }),
}

