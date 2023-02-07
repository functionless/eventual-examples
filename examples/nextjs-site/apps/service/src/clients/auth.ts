import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  NotAuthorizedException,
  PasswordResetRequiredException,
  UserNotConfirmedException,
} from "@aws-sdk/client-cognito-identity-provider";
import { ApiRequest } from "@eventual/core";

const cognitoClient = new CognitoIdentityProviderClient({});

/**
 * Validates a user and returns their information.
 *
 * @throws an {@link Error} if the user is not valid or authorized.
 */
export async function validateUserRequest(request: ApiRequest) {
  const auth = request.headers["Authorization"];
  if (!auth) {
    throw new Error("Expected Authorization header to be preset.");
  }
  const [prefix, token] = auth.split(" ");
  if (prefix?.toLowerCase() !== "basic") {
    throw new Error("Token is not valid, must be in the form 'Basic [token]'.");
  }
  return validateUser(token);
}

export async function validateUser(token: string): Promise<{
  status: "AUTHORIZED";
  username: string;
  attributes: Record<string, string>;
}> {
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
      throw new Error("User is not authorized!");
    } else if (err instanceof UserNotConfirmedException) {
      throw new Error("User is not confirmed!");
    } else if (err instanceof PasswordResetRequiredException) {
      throw new Error("User must reset password!");
    }

    throw err;
  }
}
