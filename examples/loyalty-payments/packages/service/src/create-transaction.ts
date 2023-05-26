import { workflow } from "@eventual/core";
import { v4 as uuid } from "uuid";
import { authorized } from "./auth.js";
import { Transaction } from "./data.js";

/**
 * Sets up an API that can be called to create a transaction.
 *
 * The API is authorized, expecting a JWT Bearer token.
 *
 * The JWT token is passed in to the context (second argument).
 */
export const createTransaction = authorized.command(
  "createTransaction",
  async ({}, { user }) => {
    const transactionId = uuid();

    // write the transaction into DynamoDB
    await Transaction.set({
      userId: user.userId,
      transactionId,
      createdDate: new Date().toISOString(),
    });

    return {
      transactionId,
    };
  }
);
// stream off of the dynamodb writes to reliably emit an event for each created transaction
// we could also handle the logic here but this shows how to publish events which may be more desirable
export const onTransactionCreate = Transaction.stream(
  "onTransactionCreate",
  {
    operations: ["insert"],
  },
  async (item) => {
    if (item.operation === "insert") {
      // start a workflow execution to orchestrate the transaction
      await createTransactionWorkflow.startExecution({
        // use the transaction id as the execution name for idempotency
        executionName: item.newValue.transactionId,
        input: item.newValue,
      });
    }
  }
);

export const createTransactionWorkflow = workflow(
  "createTransaction",
  async (input: {
    transactionId: string;
    userId: string;
    createdDate: string;
  }) => {}
);
