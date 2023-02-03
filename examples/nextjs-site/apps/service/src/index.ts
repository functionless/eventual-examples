import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { api, ApiResponse } from "@eventual/core";
import { CreateOrderRequest, OrderClient } from "./clients/order-client.js";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const client = new OrderClient({
  dynamo,
  tableName: process.env.TABLE_NAME ?? "",
});

api.post("/orders", async (request) => {
  const order = request.body;
  if (!isValidOrderRequest(order)) {
    return new ApiResponse("invalid order", { status: 400 });
  }
  const createOrderResult = await client.createOrder(order);

  return new ApiResponse(JSON.stringify(createOrderResult), { status: 200 });
});

function isValidOrderRequest(
  maybeOrder: any
): maybeOrder is CreateOrderRequest {
  return true;
}
