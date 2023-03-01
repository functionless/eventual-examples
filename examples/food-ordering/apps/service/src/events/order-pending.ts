import { event } from "@eventual/core";

export interface OrderPending {
  orderId: string;
}

export const orderPending = event<OrderPending>("OrderPendingEvent");
