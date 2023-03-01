import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { HttpError } from "@eventual/core";
import type { Order } from "@food-ordering/core";
import { dynamo } from "../util/clients.js";
import { orderFromRecord, OrderRecord } from "../util/order-record.js";
import { TABLE_NAME } from "../util/variables.js";
import { privateAccess } from "./middleware/default.js";
/**
 * Gets the record for an {@link Order} by its ID.
 *
 * Users must be logged in and the owner of the {@link Order} record.
 */
export const getOrder = privateAccess.command(
  "getOrder",
  async (orderId: string, { user }) => {
    const order = await getOrderRecord(orderId);
    if (order === undefined) {
      return undefined;
    } else if (order?.userId !== user.username) {
      throw new HttpError({
        code: 401,
        message: `User does not have permissions to view order ${orderId}`,
      });
    } else {
      return order;
    }
  }
);

// this is annoyingly redundant - we want to use it in a workflow
// and therefore have to pull it out separate;y
// would be better to just call the command from the workflow
// will impact how we design middleware
export async function getOrderRecord(orderId: string) {
  const item = await dynamo.send(
    new GetCommand({
      Key: {
        pk: OrderRecord.partitionKey,
        sk: OrderRecord.sortKey(orderId),
      },
      TableName: TABLE_NAME,
      ConsistentRead: true,
    })
  );

  return item.Item ? orderFromRecord(item.Item as OrderRecord) : undefined;
}
