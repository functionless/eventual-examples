import { event } from "@eventual/core";

export interface OrderComplete {
  orderId: string;
}

export const orderComplete = event<OrderComplete>("OrderCompleteEvent");
