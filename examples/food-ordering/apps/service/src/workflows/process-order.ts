import { activity, condition, workflow } from "@eventual/core";
import type { OrderStatus } from "@food-ordering/core";
import {
  updateOrderStatus,
  updateOrderStatusRecord,
} from "../api/update-order-status.js";
import { orderComplete } from "../events/order-complete.js";
import { orderPending } from "../events/order-pending.js";
import { orderReadyForPickup } from "../events/order-ready-for-pickup.js";
import { driverStatusUpdate } from "../signals/driver-status-update.js";
import { storeStatusUpdate } from "../signals/store-status-update.js";

// Workflow assumes the only status updates come through the workflow.
export const processOrder = workflow(
  "processOrder",
  async ({ orderId }: { orderId: string }, ctx) => {
    let orderStatus: OrderStatus = "CREATED" as OrderStatus;
    await updateOrderStatus("PENDING");

    // notify others about a new order, including the store
    orderPending.publishEvents({ orderId });

    const storeHandler = storeStatusUpdate.onSignal(async ({ status }) => {
      // do not go backwards, only forwards, ignore backwards updates and unexpected statuses
      if (status === "ACCEPTED" && orderStatus === "PENDING") {
        await updateOrderStatus(status);
        // don't accept the next signal until the database has been updated
      } else if (
        status === "PREPARING" &&
        (orderStatus === "PENDING" || orderStatus === "ACCEPTED")
      ) {
        await updateOrderStatus(status);
        // don't accept the next signal until the database has been updated
      } else if (
        status === "READY_FOR_PICKUP" &&
        (orderStatus === "PENDING" ||
          orderStatus === "ACCEPTED" ||
          orderStatus === "PREPARING")
      ) {
        await updateOrderStatus(status);
        // don't publish the event until the database has been updated
      }
    });

    // wait for the READY_FOR_PICKUP status before continuing to the driver state
    await condition(() => orderStatus === "READY_FOR_PICKUP");
    orderReadyForPickup.publishEvents({ orderId });
    // not required, but makes it explicit we no longer expect these signals
    storeHandler.dispose();

    // The order has left the store, handle delivery updates.
    const driverHandler = driverStatusUpdate.onSignal(async ({ status }) => {
      if (status === "IN_ROUTE" && orderStatus === "READY_FOR_PICKUP") {
        await updateOrderStatus(status);
      } else if (
        status === "DELIVERED" &&
        (orderStatus === "READY_FOR_PICKUP" || orderStatus === "IN_ROUTE")
      ) {
        await updateOrderStatus(status);
      }
    });

    // wait for the DELIVERED status before continuing to the completed state
    await condition(() => orderStatus === "DELIVERED");
    orderComplete.publishEvents({ orderId });
    driverHandler.dispose();

    return {
      orderDurationMS:
        new Date().getTime() - new Date(ctx.execution.startTime).getTime(),
    };

    async function updateOrderStatus(status: OrderStatus) {
      orderStatus = status;
      return updateOrderStatusActivity(orderId, status);
    }
  }
);

const updateOrderStatusActivity = activity(
  "updateOrderStatus",
  (orderId: string, orderStatus: OrderStatus) =>
    updateOrderStatusRecord(orderId, orderStatus)
);
