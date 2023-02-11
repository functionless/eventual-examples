import { overrideApiDomain } from "@/food-ordering-client";
import { overrideUserPoolIds } from "@/auth";
import "@/styles/globals.css";
import { UserProvider } from "@/use-user";
import type { AppContext, AppProps } from "next/app";
import App from "next/app";
import type env_override from "../../public/env_override.json";

export const _App = ({ Component, pageProps }: AppProps) => {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
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
