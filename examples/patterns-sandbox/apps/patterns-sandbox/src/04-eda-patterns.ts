import {
  DynamoDBClient,
  ReturnValue,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

declare const dynamo: DynamoDBClient;
declare const act1: ActivityFunction<any, any>;
declare const act2: ActivityFunction<any, any>;

/**
 * Process Manager
 *
 * Orchestrates multiple operations and services over time, this is a `workflow`.
 */

import { ActivityFunction, workflow, event, condition } from "@eventual/core";

const myWorkflow = workflow("myWorkflow", async () => {
  await act1();
  await act2();
});

/**
 * Event Sourcing
 *
 * Store events and use this information to calculate state.
 *
 * This can be done either with a data store like dynamo, a workflow, or a combination.
 */

const sumEvent = event<{ num: number }>("sumEvent");

// workflow are great when something needs to be done when the system gets to a state.
// accumulate until the sum is 100 and then call act1.
const eventSourceWorkflow = workflow("myWorkflow", async () => {
  let sum: number = 0;
  sumEvent.onEvent(async ({ num }) => {
    sum += num;
  });

  await condition(() => sum < 100);

  await act1();
});

// using an external data source to accumulate data
sumEvent.onEvent(async ({ num }) => {
  const updated = dynamo.send(
    new UpdateItemCommand({
      TableName: "",
      Key: { pk: { S: "1001" } },
      UpdateExpression: "SET sum = sum + #num ",
      ExpressionAttributeValues: {
        "#num": { N: num.toString() },
      },
      ReturnValues: ReturnValue.UPDATED_NEW,
    })
  );

  const { sum: { N: nsum = "0" } = {} } = (await updated).Attributes ?? {};

  if (Number(nsum) > 100) {
    // do something
  }
});
