import {
  CommandContext,
  HttpError,
  MiddlewareInput,
  api,
} from "@eventual/core";

import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "./data.js";

const mySecret = "my-secret";

export interface AuthorizedContext {
  user: User;
}

export const authorized = api.use(authorizeJWT);

export async function authorizeJWT<In extends CommandContext>({
  request,
  next,
  context,
}: MiddlewareInput<In>) {
  const auth = request.headers.get("Authorization");
  if (!auth) {
    throw new HttpError({
      code: 401,
      message: "Expected Authorization header to be preset.",
    });
  }
  const [prefix, token] = auth.split(" ");
  if (prefix?.toLowerCase() !== "Bearer") {
    throw new HttpError({
      code: 400,
      message: "Token is not valid, must be in the form 'Bearer [token]'.",
    });
  }

  const jwtPayload = jwt.verify(token, mySecret) as JwtPayload;
  const user = await User.get({
    userId: jwtPayload.iss!,
  });
  if (user === undefined) {
    throw new HttpError({
      code: 401,
      message: `Unauthorized`,
    });
  }

  return next({
    ...context,
    // put the JWT token and user record in the context for commands to access
    jwt: jwtPayload,
    user,
  });
}
