import { ServiceClient } from "@eventual/client";
import * as FoodOrderingService from "@food-ordering/service";
import type { CognitoUserSession } from "amazon-cognito-identity-js";

let apiDomain: string | undefined = process.env.NEXT_PUBLIC_EVENTUAL_API_DOMAIN;

export function useService(session: CognitoUserSession | null | undefined) {
  return new ServiceClient<typeof FoodOrderingService>({
    serviceUrl: apiDomain!,
    beforeRequest: async (request) => {
      if (session) {
        request.headers ??= {};
        request.headers.Authorization = `Basic ${session
          .getAccessToken()
          .getJwtToken()}`;
      }
      return request;
    },
  });
}
