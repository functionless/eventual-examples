import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  UserData,
} from "amazon-cognito-identity-js";

const userPool = new CognitoUserPool({
  UserPoolId: "us-east-1_Pl1wNTMfV", // Your user pool id here
  ClientId: "a4f5eusm699it63gfa5r2g7lp", // Your client id here
});

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
    userPool.signUp(
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
  const user = new CognitoUser({ Pool: userPool, Username: userName });
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
  return userPool.getCurrentUser() ?? undefined;
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
