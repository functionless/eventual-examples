import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { command } from "@eventual/core";
import { CreateOrderRequest, Order } from "@food-ordering/core";
import { ulid } from "ulidx";
import { dynamo } from "../util/clients.js";
import { OrderRecord } from "../util/order-record.js";
import { TABLE_NAME } from "../util/variables.js";
import { processOrder } from "../workflows/process-order.js";

export const createOrder = command(
  "createOrder",
  {},
  // TODO: middleware for auth - context can be populated by middleware
  // @ts-expect-error
  async (orderRequest: CreateOrderRequest, { user }) => {
    const order: Order = {
      ...orderRequest,
      id: ulid(),
      status: "CREATED",
      timestamp: new Date().toISOString(),
    };

    const orderRecord: OrderRecord = {
      ...order,
      pk: OrderRecord.partitionKey,
      sk: OrderRecord.sortKey(order.id),
      // the sort key we will use to order user records by timestamp
      user_time: OrderRecord.userTime(order.userId, order.timestamp),
    };

    await dynamo.send(
      new PutCommand({
        Item: orderRecord,
        TableName: TABLE_NAME,
        ConditionExpression: "attribute_not_exists(sk)",
      })
    );

    await processOrder.startExecution({
      input: { orderId: orderRecord.id },
      executionName: orderRecord.id,
    });

    return order;
  }
);

function isValidOrderRequest(
  maybeOrder: any
): maybeOrder is CreateOrderRequest {
  return true;
}
