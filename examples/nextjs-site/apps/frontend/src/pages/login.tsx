import { currentUser, signIn } from "@/auth";
import Layout from "@/layout";
import useUser from "@/use-user";
import { Box, TextField, Link, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useState, useCallback, ChangeEvent, useContext } from "react";

export default function Home() {
  const router = useRouter();
  const { setUser } = useUser({ redirectTo: "/", redirectIfFound: true });
  const [userName, setUserName] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();

  const login = useCallback(() => {
    if (userName && password) {
      signIn(userName, password).then(() => setUser?.(currentUser()));
    }
  }, [userName, password]);

  function changeUser(event: ChangeEvent<HTMLInputElement>) {
    setUserName(event.target.value);
  }
  function changePassword(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  return (
    <Layout>
      <div>
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "25ch" },
            padding: 5,
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              required
              id="user-name"
              label="User Name"
              variant="standard"
              onChange={changeUser}
            />
            <TextField
              required
              id="password"
              label="Password"
              type={"password"}
              onChange={changePassword}
            />
          </div>
          <div>
            <Button onClick={login} component="button" variant="contained">
              Login
            </Button>
          </div>
          <br />
          New Here? <Link href="/register">Register</Link>
        </Box>
      </div>
    </Layout>
  );
}
