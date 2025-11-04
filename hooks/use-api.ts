"use client"

import { useState, useEffect, useCallback } from "react"
import { api, ApiError, apiRequest } from "@/lib/api-client"

type UseApiOptions<T> = {
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
  enabled?: boolean
  refetchInterval?: number
}

type UseApiResult<T> = {
  data: T | null
  loading: boolean
  error: ApiError | null
  refetch: () => Promise<void>
}

/**
 * Generic hook for fetching data from API
 */
export function useApi<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { onSuccess, onError, enabled = true, refetchInterval } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await api.get<T>(endpoint, params)
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError("Unknown error", 0)
      setError(apiError)
      onError?.(apiError)
    } finally {
      setLoading(false)
    }
  }, [endpoint, params, enabled, onSuccess, onError])

  useEffect(() => {
    fetchData()

    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refetchInterval])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

/**
 * Hook for mutations (POST, PUT, DELETE, etc.)
 */
export function useApiMutation<TData, TVariables = any>(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST"
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(
    async (variables?: TVariables, params?: Record<string, string | number | boolean | undefined>) => {
      setLoading(true)
      setError(null)

      try {
        const result = await apiRequest<TData>(endpoint, {
          method,
          body: variables,
          params,
        })
        return result
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError("Unknown error", 0)
        setError(apiError)
        throw apiError
      } finally {
        setLoading(false)
      }
    },
    [endpoint, method]
  )

  return {
    mutate,
    loading,
    error,
  }
}

