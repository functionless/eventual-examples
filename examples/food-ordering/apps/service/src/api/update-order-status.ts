import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { api, HttpError } from "@eventual/core";
import { OrderStatus } from "@food-ordering/core";
import { dynamo } from "../util/clients.js";
import { OrderRecord } from "../util/order-record.js";
import { TABLE_NAME } from "../util/variables.js";
import { authorized } from "./middleware/auth.js";
import { orderFromRecord } from "../util/order-record.js";
import { privateAccess } from "./middleware/default.js";

/**
 * Updates the status of an {@link Order}
 */
export const updateOrderStatus = privateAccess.command(
  "updateOrderStatus",
  async (
    { orderId, status }: { orderId: string; status: OrderStatus },
    { user }
  ) => {
    try {
      return await updateOrderStatusRecord(orderId, status, user.username);
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        throw new HttpError({
          code: 401,
          message: `User is not authorized to modify order ${orderId}`,
        });
      }
      throw err;
    }

    // TODO: emit event on order update
  }
);

export async function updateOrderStatusRecord(
  orderId: string,
  status: OrderStatus,
  userId?: string
) {
  const result = await dynamo.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: OrderRecord.partitionKey,
        sk: OrderRecord.sortKey(orderId),
      },
      UpdateExpression: "SET #status=:status",
      ConditionExpression: userId ? "#user = :user" : undefined,
      ExpressionAttributeNames: {
        "#status": "status",
        ...(userId
          ? {
              "#user": "username",
            }
          : {}),
      },
      ExpressionAttributeValues: {
        ":status": status,
        ...(userId
          ? {
              ":user": userId,
            }
          : {}),
      },
    })
  );

  return orderFromRecord({
    pk: OrderRecord.partitionKey,
    sk: OrderRecord.sortKey(orderId),
    ...(result.Attributes as any),
  });
}
