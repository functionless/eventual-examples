import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import React, { useContext, useEffect, useState } from "react";
import { _Menu } from "./menu";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/router";
import { UserContext } from "./user-context";

const inter = Inter({ subsets: ["latin"] });

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Layout({
  mode,
  children,
}: React.PropsWithChildren<{
  mode: "authed" | "unauthed" | "any";
}>) {
  const { user } = useContext(UserContext);
  const router = useRouter();
  useEffect(() => {
    if (!user && mode === "authed") {
      router.push("/login");
      return;
    }
    if (user && mode === "unauthed") {
      router.push("/");
      return;
    }
  }, [mode, user]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <ThemeProvider theme={darkTheme}>
          <>
            <div>
              <_Menu />
            </div>
            <div>{children}</div>
          </>
        </ThemeProvider>
      </main>
    </>
  );
}
