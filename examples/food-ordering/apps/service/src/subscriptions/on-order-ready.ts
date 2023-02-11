import { orderReadyForPickup } from "../events/order-ready-for-pickup.js";
import { simulateDriver } from "../workflows/simulate-driver.js";

// for each order pending event, start a store workflow.
export const onOrderReady = orderReadyForPickup.onEvent(
  "onOrderReadyForPickup",
  async ({ orderId }: { orderId: string }) => {
    // start a unique driver workflow for each order
    // NOTE: an interesting variant would be to start some number of drivers and are assigned/claim orders.
    await simulateDriver.startExecution({
      input: { orderId },
      executionName: orderId,
    });
  }
);
