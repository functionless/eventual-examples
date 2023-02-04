import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  activity,
  api,
  ApiResponse,
  Body,
  condition,
  duration,
  event,
  signal,
  workflow,
} from "@eventual/core";
import { CreateOrderRequest, OrderStatus } from "@nextjs-site/core";
import { OrderClient } from "./clients/order-client.js";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const client = new OrderClient({
  dynamo,
  tableName: process.env.TABLE_NAME ?? "",
});

// for testing
// TODO: support
const cors = {
  "Access-Control-Allow-Origin": "*",
};

class CorsInjectedApiResponse extends ApiResponse {
  constructor(
    body: Body | undefined,
    init: {
      status: number;
      statusText?: string;
      headers?: Record<string, string> | Headers;
    }
  ) {
    super(body, {
      ...init,
      headers: {
        ...cors,
        ...init.headers,
      },
    });
  }
}

api.post("/orders", async (request) => {
  const order = await request.json();
  if (!isValidOrderRequest(order)) {
    return new CorsInjectedApiResponse("invalid order", { status: 400 });
  }
  console.log(JSON.stringify(order));
  const createOrderResult = await client.createOrder(order);

  await orderWorkflow.startExecution({
    input: { orderId: createOrderResult.orderId },
    executionName: createOrderResult.orderId,
  });

  return new CorsInjectedApiResponse(JSON.stringify(createOrderResult), {
    status: 200,
    headers: {
      ...cors,
    },
  });
});

api.get("/orders/:orderId", async (request) => {
  const orderId = request.params?.orderId;
  if (!orderId) {
    return new CorsInjectedApiResponse("order id must be present", {
      status: 400,
    });
  }

  const order = await client.getOrder(orderId);

  if (!order) {
    return new CorsInjectedApiResponse("Order not found", { status: 401 });
  }

  return new CorsInjectedApiResponse(JSON.stringify(order), { status: 200 });
});

api.get("/orders", async (request) => {
  const userId = request.query?.userId;
  if (!userId || typeof userId !== "string") {
    return new CorsInjectedApiResponse(
      "List API requires a single user id, for now",
      {
        status: 400,
      }
    );
  }

  const orders = await client.getOrders(userId);

  return new CorsInjectedApiResponse(JSON.stringify({ orders: orders }), {
    status: 200,
  });
});

export interface SetOrderStatusRequest {
  status: OrderStatus;
}

api.put("/orders/:orderId/status", async (request) => {
  const orderId = request.params?.orderId;
  if (!orderId) {
    return new CorsInjectedApiResponse("order id must be present", {
      status: 400,
    });
  }

  const body = await request.json();
  if (!isValidSetOrderStatusRequest(body)) {
    return new CorsInjectedApiResponse("invalid request body", { status: 400 });
  }

  await client.updateOrderStatus(orderId, body.status);

  // TODO: emit event on order update

  // accepted
  return new CorsInjectedApiResponse(undefined, { status: 202 });
});

/**
 * Signal sent when a store updates the status.
 */
const storeStatusUpdate = signal<{
  status: Extract<OrderStatus, "PREPARING" | "READY_FOR_PICKUP" | "ACCEPTED">;
}>("StoreStatusUpdate");

const driverStatusUpdate = signal<{
  status: Extract<OrderStatus, "IN_ROUTE" | "DELIVERED">;
}>("DriverStatusUpdate");

const orderPendingEvent = event<{ orderId: string }>("OrderPendingEvent");
const orderReadyForPickupEvent = event<{ orderId: string }>(
  "OrderReadyForPickupEvent"
);
const orderCompleteEvent = event<{ orderId: string }>("OrderCompleteEvent");

// Workflow assumes the only status updates come through the workflow.
export const orderWorkflow = workflow(
  "orderWorkflow",
  async ({ orderId }: { orderId: string }, ctx) => {
    let orderStatus: OrderStatus = "CREATED" as OrderStatus;
    await updateOrderStatus("PENDING");

    // notify others about a new order, including the store
    orderPendingEvent.publishEvents({ orderId });

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
    orderReadyForPickupEvent.publishEvents({ orderId });
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
    orderCompleteEvent.publishEvents({ orderId });
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

const mockStoreWorkflow = workflow(
  "mockStore",
  async ({ orderId }: { orderId: string }) => {
    const orderExecutionId = `${orderWorkflow.workflowName}/${orderId}`;

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

const mockDriverWorkflow = workflow(
  "mockDriver",
  async ({ orderId }: { orderId: string }) => {
    const orderExecutionId = `${orderWorkflow.workflowName}/${orderId}`;

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

// for each order pending event, start a store workflow.
orderPendingEvent.onEvent(async ({ orderId }: { orderId: string }) => {
  // start a unique store workflow for each order
  // NOTE: an interesting variant would be to start a single store for each store that accepts many order.
  await mockStoreWorkflow.startExecution({
    input: { orderId },
    executionName: orderId,
  });
});

// for each order pending event, start a store workflow.
orderReadyForPickupEvent.onEvent(async ({ orderId }: { orderId: string }) => {
  // start a unique driver workflow for each order
  // NOTE: an interesting variant would be to start some number of drivers and are assigned/claim orders.
  await mockDriverWorkflow.startExecution({
    input: { orderId },
    executionName: orderId,
  });
});

export const getOrderActivity = activity("getOrder", (orderId: string) =>
  client.getOrder(orderId)
);
export const updateOrderStatusActivity = activity(
  "updateOrderStatus",
  (orderId: string, orderStatus: OrderStatus) =>
    client.updateOrderStatus(orderId, orderStatus)
);

function isValidOrderRequest(
  maybeOrder: any
): maybeOrder is CreateOrderRequest {
  return true;
}

function isValidSetOrderStatusRequest(
  maybeOrderUpdate: any
): maybeOrderUpdate is SetOrderStatusRequest {
  return true;
}
