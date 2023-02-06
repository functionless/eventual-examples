import { currentUser, signUp } from "@/auth";
import Layout from "@/layout";
import { UserContext } from "@/user-context";
import { Box, TextField, Button } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useContext, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { setUser } = useContext(UserContext);
  const [userName, setUserName] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();

  const register = useCallback(() => {
    if (userName && email && password) {
      signUp(userName, email, password).then(() => setUser?.(currentUser()));
    }
  }, [userName, email, password, setUser]);

  function changeUser(event: ChangeEvent<HTMLInputElement>) {
    setUserName(event.target.value);
  }
  function changeEmail(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }
  function changePassword(event: ChangeEvent<HTMLInputElement>) {
    console.log("hi");
    setPassword(event.target.value);
  }

  return (
    <Layout mode="unauthed">
      <div>
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "25ch" },
            padding: 5,
          }}
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
              id="email"
              label="Email"
              type={"email"}
              onChange={changeEmail}
            />
            <TextField
              required
              id="password"
              label="Password"
              type={"password"}
              onChange={changePassword}
            />
          </div>
          <Button onClick={register} component="button" variant="contained">
            Register
          </Button>
        </Box>
      </div>
    </Layout>
  );
}
