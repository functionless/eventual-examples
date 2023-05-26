import { time, transaction, workflow } from "@eventual/core";
import { v4 as uuid } from "uuid";
import { Award, User } from "./data.js";

export const createAward = transaction(
  "createAward",
  async (input: {
    awardId: string;
    userId: string;
    amount: number;
    expiry?: string;
    currency: string;
  }) => {
    const awardId = uuid();
    const user = await User.get({
      userId: input.userId,
    });

    await Award.set({
      awardId,
      userId: input.userId,
      amount: input.amount,
      awardTime: new Date().toISOString(),
      company: "TODO",
      currency: input.currency,
      expired: false,
    });

    await User.set({
      ...user,
      credits: {
        ...user.credits,
        [input.currency]: (user.credits[input.currency] ?? 0) + input.amount,
      },
    });
  }
);

// every time an Award is created, start a workflow to track it, e.g. expire it
export const onAwardCreated = Award.stream(
  "onAwardCreated",
  {
    operations: ["insert"],
  },
  async (event) => {
    if (event.operation === "insert") {
      await awardPointsWorkflow.startExecution({
        executionName: event.newValue.awardId,
        input: event.newValue,
      });
    }
  }
);

export const awardPointsWorkflow = workflow(
  "awardPoints",
  async (input: {
    awardId: string;
    userId: string;
    amount: number;
    expiry?: string;
    currency: string;
  }) => {
    if (input.expiry) {
      // wait until the time it expires
      await time(input.expiry);

      // then expire it
      await expireAward(input.awardId);
    }
  }
);

/**
 * Use a Transaction to atomically get/set the Award record to expire it
 */
export const expireAward = transaction(
  "expireAward",
  async (awardId: string) => {
    const award = await Award.get({
      awardId,
    });

    if (!award.expired) {
      Award.set({
        ...award,
        expired: true,
      });
    }
  }
);
