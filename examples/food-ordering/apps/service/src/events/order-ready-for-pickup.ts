import { event } from "@eventual/core";

export interface OrderReadyForPickup {
  orderId: string;
}

export const orderReadyForPickup = event<OrderReadyForPickup>(
  "OrderReadyForPickupEvent"
);
