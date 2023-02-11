import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { command } from "@eventual/core";
import { OrderStatus } from "@food-ordering/core";
import { dynamo, orderClient } from "../util/clients.js";
import { OrderRecord } from "../util/order-record.js";
import { TABLE_NAME } from "../util/variables.js";

export const updateOrderStatus = command(
  "updateOrderStatus",
  async (
    { orderId, status }: { orderId: string; status: OrderStatus },
    // @ts-expect-error - we need middleware
    { user }
  ) => {
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: OrderRecord.partitionKey,
          sk: OrderRecord.sortKey(orderId),
        },
        UpdateExpression: "SET #status=:status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
        },
      })
    );

    await orderClient.updateOrderStatus(orderId, status);

    // TODO: emit event on order update
  }
);
