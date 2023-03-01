import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { currentUser, getSession, refreshSession } from "./auth";

export const UserContext = createContext<{
  user?: CognitoUser | null;
  setUser?: (user?: CognitoUser) => void;
}>({});

export function UserProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<CognitoUser | undefined | null>(null);

  useEffect(() => {
    const user = currentUser();
    setUser(user);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export default function useUser({
  redirectTo = undefined,
  redirectIfFound = false,
}: { redirectTo?: string; redirectIfFound?: boolean } = {}) {
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  const [session, setSession] = useState<CognitoUserSession | undefined | null>(
    null
  );

  useEffect(() => {
    if (!user) {
      setSession(undefined);
    } else {
      getSession().then(async (session) => {
        if (session && !session.isValid()) {
          await refreshSession(user, session.getRefreshToken());
        }
        setSession(session);
      });
    }
  }, [user]);

  useEffect(() => {
    if (!redirectTo || (user && !session) || user === null || session === null)
      return;

    if (
      (redirectIfFound && session && user) ||
      (!redirectIfFound && (!session || !user))
    ) {
      router.push(redirectTo);
    }
  }, [user, session, redirectIfFound, redirectTo]);

  return { user, session, setUser };
}
