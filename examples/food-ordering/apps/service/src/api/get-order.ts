import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { api, command } from "@eventual/core";
import { dynamo, orderClient } from "../util/clients.js";
import { orderFromRecord, OrderRecord } from "../util/order-record.js";
import { TABLE_NAME } from "../util/variables.js";

export const getOrder = command("getOrder", async (orderId: string) => {
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
});
