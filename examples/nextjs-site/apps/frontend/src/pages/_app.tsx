import { currentUser } from "@/auth";
import "@/styles/globals.css";
import { UserContext } from "@/user-context";
import { CognitoUser } from "amazon-cognito-identity-js";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState<CognitoUser | undefined>();
  useEffect(() => {
    const user = currentUser();
    setUser(user);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}
