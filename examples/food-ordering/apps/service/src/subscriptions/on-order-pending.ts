import { orderPending } from "../events/order-pending.js";
import { simulateStore } from "../workflows/simulate-store.js";

// for each order pending event, start a store workflow.
export const onOrderPending = orderPending.onEvent(
  "onOrderPending",
  async ({ orderId }: { orderId: string }) => {
    // start a unique store workflow for each order
    // NOTE: an interesting variant would be to start a single store for each store that accepts many order.
    await simulateStore.startExecution({
      input: { orderId },
      executionName: orderId,
    });
  }
);
