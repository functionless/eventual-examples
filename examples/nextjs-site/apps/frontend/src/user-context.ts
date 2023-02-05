import { CognitoUser } from "amazon-cognito-identity-js";
import { createContext } from "react";

export const UserContext = createContext<{
  user?: CognitoUser;
  setUser?: (user: CognitoUser | undefined) => void;
}>({ user: undefined, setUser: undefined });
