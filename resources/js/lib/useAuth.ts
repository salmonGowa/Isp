import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api";
import { staffApi } from "./staffApi";
import { portalApi } from "./portalApi";
import type { StaffUser, SubscriberUser } from "./types";

type AuthStatus = "loading" | "authed" | "guest";

interface AuthState<U> {
  status: AuthStatus;
  user: U | null;
}

function useSessionAuth<U>(
  meFn: () => Promise<{ data: U }>,
  loginFn: (email: string, password: string) => Promise<{ data: U }>,
  logoutFn: () => Promise<void>,
) {
  const [state, setState] = useState<AuthState<U>>({ status: "loading", user: null });

  useEffect(() => {
    let cancelled = false;

    meFn()
      .then((res) => {
        if (!cancelled) setState({ status: "authed", user: res.data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "guest", user: null });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginFn(email, password);
      setState({ status: "authed", user: res.data });
    },
    [loginFn],
  );

  const logout = useCallback(async () => {
    try {
      await logoutFn();
    } finally {
      setState({ status: "guest", user: null });
    }
  }, [logoutFn]);

  return { ...state, login, logout, setUser: (user: U) => setState({ status: "authed", user }) };
}

export function useStaffAuth() {
  return useSessionAuth<StaffUser>(staffApi.auth.me, staffApi.auth.login, staffApi.auth.logout);
}

export function useSubscriberAuth() {
  return useSessionAuth<SubscriberUser>(portalApi.auth.me, portalApi.auth.login, portalApi.auth.logout);
}

export { ApiError };
