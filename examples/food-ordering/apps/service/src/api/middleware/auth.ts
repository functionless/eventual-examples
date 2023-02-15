import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  NotAuthorizedException,
  PasswordResetRequiredException,
  UserNotConfirmedException,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  HttpError,
  HttpRequest,
  HttpResponse,
  MiddlewareInput,
  MiddlewareOutput,
} from "@eventual/core";

const cognitoClient = new CognitoIdentityProviderClient({});

export interface AuthorizedContext {
  user: User;
}

export async function authorized<In>({
  request,
  next,
  context,
}: MiddlewareInput<In>) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    throw new HttpError({
      code: 401,
      message: "Expected Authorization header to be preset.",
    });
  }
  const [prefix, token] = auth.split(" ");
  if (prefix?.toLowerCase() !== "basic") {
    throw new HttpError({
      code: 400,
      message: "Token is not valid, must be in the form 'Basic [token]'.",
    });
  }
  const user = await validateUser(token);

  return next({
    ...context,
    user,
  });
}

export async function validateUser(token: string): Promise<User> {
  try {
    const result = await cognitoClient.send(
      new GetUserCommand({
        AccessToken: token,
      })
    );
    return {
      username: result.Username!,
      attributes: Object.fromEntries(
        result.UserAttributes?.map(({ Name, Value }) => [Name, Value]) ?? []
      ),
      status: "AUTHORIZED",
    };
  } catch (err) {
    if (err instanceof NotAuthorizedException) {
      throw new HttpError({
        code: 401,
        message: "User is not authorized!",
      });
    } else if (err instanceof UserNotConfirmedException) {
      throw new HttpError({
        code: 401,
        message: "User is not confirmed!",
      });
    } else if (err instanceof PasswordResetRequiredException) {
      throw new HttpError({
        code: 401,
        message: "User must reset password!",
      });
    }

    throw err;
  }
}

export interface User {
  status: "AUTHORIZED";
  username: string;
  attributes: Record<string, string>;
}
