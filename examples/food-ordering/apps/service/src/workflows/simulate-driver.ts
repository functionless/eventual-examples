import { duration, workflow } from "@eventual/core";
import { driverStatusUpdate } from "../signals/driver-status-update.js";
import { processOrder } from "./process-order.js";

export const simulateDriver = workflow(
  "mockDriver",
  async ({ orderId }: { orderId: string }) => {
    const orderExecutionId = `${processOrder.workflowName}/${orderId}`;

    // the driver picks up the order
    driverStatusUpdate.sendSignal(orderExecutionId, {
      status: "IN_ROUTE",
    });
    await duration(2, "minutes");
    // the driver drops off the order (SO FAST!)
    driverStatusUpdate.sendSignal(orderExecutionId, {
      status: "DELIVERED",
    });
    return;
  }
);
