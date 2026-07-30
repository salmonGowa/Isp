import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api";

interface ApiResourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch-on-mount-and-on-deps-change, used by every list/detail view instead
 * of hand-rolling the same useEffect/useState triple repeatedly.
 */
export function useApiResource<T>(fetcher: () => Promise<T>, deps: React.DependencyList) {
  const [state, setState] = useState<ApiResourceState<T>>({ data: null, loading: true, error: null });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
        setState({ data: null, loading: false, error: message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
