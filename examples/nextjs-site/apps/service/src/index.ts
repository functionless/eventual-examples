import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { api, ApiResponse } from "@eventual/core";
import { OrderStatus } from "@nextjs-site/core";
import { CreateOrderRequest, OrderClient } from "./clients/order-client.js";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const client = new OrderClient({
  dynamo,
  tableName: process.env.TABLE_NAME ?? "",
});

api.post("/orders", async (request) => {
  const order = await request.json();
  if (!isValidOrderRequest(order)) {
    return new ApiResponse("invalid order", { status: 400 });
  }
  console.log(JSON.stringify(order));
  const createOrderResult = await client.createOrder(order);

  // TODO: emit event on new order

  return new ApiResponse(JSON.stringify(createOrderResult), { status: 200 });
});

api.get("/orders/:orderId", async (request) => {
  const orderId = request.params?.orderId;
  if (!orderId) {
    return new ApiResponse("order id must be present", { status: 400 });
  }

  const order = await client.getOrder(orderId);

  if (!order) {
    return new ApiResponse("Order not found", { status: 401 });
  }

  return new ApiResponse(JSON.stringify(order), { status: 200 });
});

api.get("/orders", async (request) => {
  const userId = request.query?.userId;
  if (!userId || typeof userId !== "string") {
    return new ApiResponse("List API requires a single user id, for now", {
      status: 400,
    });
  }

  const orders = await client.getOrders(userId);

  return new ApiResponse(JSON.stringify({ orders: orders }), { status: 200 });
});

export interface SetOrderStatusRequest {
  status: OrderStatus;
}

api.put("/orders/:orderId/status", async (request) => {
  const orderId = request.params?.orderId;
  if (!orderId) {
    return new ApiResponse("order id must be present", { status: 400 });
  }

  const body = await request.json();
  if (!isValidSetOrderStatusRequest(body)) {
    return new ApiResponse("invalid request body", { status: 400 });
  }

  await client.updateOrderStatus(orderId, body.status);

  // TODO: emit event on order update

  // accepted
  return new ApiResponse(undefined, { status: 202 });
});

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
