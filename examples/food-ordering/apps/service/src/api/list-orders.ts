import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { command } from "@eventual/core";
import { dynamo } from "../util/clients.js";
import { orderFromRecord, OrderRecord } from "../util/order-record.js";
import { TABLE_NAME } from "../util/variables.js";

export const listOrders = command(
  "listOrders",
  // @ts-expect-error - we need middleware
  async (_: any, { user }) => {
    const { Items } = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: OrderRecord.userTimeIndex,
        KeyConditionExpression: "pk=:pk and begins_with(user_time, :userId)",
        // newest first
        ScanIndexForward: false,
        ExpressionAttributeValues: {
          ":userId": user.userId,
          ":pk": OrderRecord.partitionKey,
        },
        ConsistentRead: true,
      })
    );

    return (Items as OrderRecord[]).map(orderFromRecord) ?? {};
  }
);
