import { ServiceClient } from "@eventual/client";

import * as FoodOrderingService from "@food-ordering/service";

let apiDomain: string | undefined = process.env.NEXT_PUBLIC_EVENTUAL_API_DOMAIN;

export const foodOrderingService = new ServiceClient<
  typeof FoodOrderingService
>({
  serviceUrl: apiDomain!,
});

// huh?
export function overrideApiDomain(domain: string) {
  apiDomain = domain;
}
