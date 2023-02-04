import {
  CreateOrderRequest,
  CreateOrderResult,
  Order,
} from "@nextjs-site/core";

const apiDomain = "https://ajxh10hwnd.execute-api.us-east-1.amazonaws.com";

export async function getOrders(user: string) {
  const r = await fetch(`${apiDomain}/orders?userId=${user}`, {
    method: "GET",
  });
  const j = await r.json();
  return j.orders;
}

export async function startOrder(
  create: CreateOrderRequest
): Promise<CreateOrderResult> {
  const r = await fetch(`${apiDomain}/orders`, {
    method: "POST",
    body: JSON.stringify(create),
  });
  const j = await r.json();
  return j;
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  const r = await fetch(`${apiDomain}/orders/${orderId}`, {
    method: "GET",
  });
  if (r.status === 401) {
    return undefined;
  }
  const j = await r.json();
  return j;
}
