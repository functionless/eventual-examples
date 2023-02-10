import type {
  CreateOrderRequestWithoutUser,
  CreateOrderResult,
  Order,
} from "@nextjs-site/core";

let apiDomain: string | undefined = process.env.NEXT_PUBLIC_EVENTUAL_API_DOMAIN;

export function overrideApiDomain(domain: string) {
  apiDomain = domain;
}

export async function getOrders(token: string) {
  const r = await fetch(`${apiDomain}/orders`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${token}`,
    },
  });
  const j = await r.json();
  return j.orders;
}

export async function startOrder(
  create: CreateOrderRequestWithoutUser,
  token: string
): Promise<CreateOrderResult> {
  const r = await fetch(`${apiDomain}/orders`, {
    method: "POST",
    body: JSON.stringify(create),
    headers: {
      Authorization: `Basic ${token}`,
    },
  });
  const j = await r.json();
  return j;
}

export async function getOrder(
  orderId: string,
  token: string
): Promise<Order | undefined> {
  const r = await fetch(`${apiDomain}/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${token}`,
    },
  });
  if (r.status === 401) {
    return undefined;
  }
  const j = await r.json();
  return j;
}
