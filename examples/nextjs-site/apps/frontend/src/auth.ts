import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  UserData,
} from "amazon-cognito-identity-js";

let userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID;
let userClientId = process.env.NEXT_PUBLIC_USER_POLL_CLIENT_ID;

console.log(userPoolId, userClientId);

export function overrideUserPoolIds(
  _userPoolId: string | null,
  _userClientId: string | null
) {
  userPoolId = _userPoolId ?? userPoolId;
  userClientId = _userClientId ?? userClientId;
}

let _userPool: CognitoUserPool | undefined;
function userPool() {
  if (!_userPool) {
    if (!userPoolId || !userClientId) {
      throw new Error("");
    }
    _userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: userClientId,
    });
  }
  return _userPool!;
}

export async function signUp(
  userName: string,
  email: string,
  password: string
) {
  const attributeList: CognitoUserAttribute[] = [
    new CognitoUserAttribute({
      Name: "email",
      Value: email,
    }),
  ];

  return new Promise((resolve, reject) => {
    userPool().signUp(
      userName,
      password,
      attributeList,
      [],
      function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  });
}

export async function signIn(userName: string, password: string) {
  const user = new CognitoUser({ Pool: userPool(), Username: userName });
  user.setAuthenticationFlowType("USER_PASSWORD_AUTH");
  return new Promise<CognitoUser>((resolve, reject) => {
    user.authenticateUser(
      new AuthenticationDetails({ Username: userName, Password: password }),
      {
        onSuccess: () => {
          resolve(user);
        },
        onFailure: reject,
      }
    );
  });
}

export function currentUser() {
  return userPool().getCurrentUser() ?? undefined;
}

export async function getCurrentUserData() {
  const user = currentUser();
  if (user) {
    return new Promise<UserData | undefined>((resolve, reject) => {
      user.getUserData((err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
  return undefined;
}

export async function signOut() {
  const user = currentUser();
  if (user) {
    return new Promise<void>((resolve) => {
      user.signOut(resolve);
    });
  }
}
