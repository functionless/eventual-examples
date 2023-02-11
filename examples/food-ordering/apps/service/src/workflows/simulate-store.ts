import { duration, workflow } from "@eventual/core";
import { orderPending } from "../events/order-pending.js";
import { storeStatusUpdate } from "../signals/store-status-update.js";
import { processOrder } from "./process-order.js";

export const simulateStore = workflow(
  "simulateStore",
  async ({ orderId }: { orderId: string }) => {
    const orderExecutionId = `${processOrder.workflowName}/${orderId}`;

    // store gets the order and accepts it
    storeStatusUpdate.sendSignal(orderExecutionId, {
      status: "ACCEPTED",
    });
    await duration(30, "seconds");
    // it starts to work on the order
    storeStatusUpdate.sendSignal(orderExecutionId, {
      status: "PREPARING",
    });
    await duration(1, "minute");
    // the order is ready
    storeStatusUpdate.sendSignal(orderExecutionId, {
      status: "READY_FOR_PICKUP",
    });
    return;
  }
);
