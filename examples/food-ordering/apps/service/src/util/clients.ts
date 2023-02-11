import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { OrderClient } from "./order-record.js";

export const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const orderClient = new OrderClient({
  dynamo,
  tableName: process.env.TABLE_NAME ?? "",
});
