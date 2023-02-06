import { overrideApiDomain } from "@/api";
import { currentUser, overrideUserPoolIds } from "@/auth";
import "@/styles/globals.css";
import { UserContext } from "@/user-context";
import { CognitoUser } from "amazon-cognito-identity-js";
import type { AppContext, AppProps } from "next/app";
import App from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type env_override from "../../public/env_override.json";

export const _App = ({ Component, pageProps }: AppProps) => {
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
};

_App.getInitialProps = async (context: AppContext) => {
  const ctx = await App.getInitialProps(context);

  try {
    const overrides: typeof env_override = await (
      await fetch("/env_override.json")
    ).json();

    if (overrides.eventualApi) {
      overrideApiDomain(overrides.eventualApi);
    }
    if (overrides.userPoolId || overrides.userPoolClientId) {
      overrideUserPoolIds(overrides.userPoolId, overrides.userPoolClientId);
    }
  } catch {}

  return { ...ctx };
};

export default _App;
