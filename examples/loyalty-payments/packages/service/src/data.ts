import { entity } from "@eventual/core";
import { z } from "zod";

export interface User {
  userId: string;
  birthDate: string;
}

export const User = entity("User", {
  attributes: {
    userId: z.string(),
    birthDate: z.string(),
    credits: z.record(z.enum(["Points", "USD", "EUR"]), z.number()),
    level: z.number(),
  },
  partition: ["userId"],
});

export const Award = entity("Award", {
  attributes: {
    userId: z.string(),
    awardId: z.string(),
    awardTime: z.string(),
    company: z.string(),
    amount: z.number(),
    currency: z.string(),
    /**
     * Whether this award has been expired
     */
    expired: z.boolean().optional(),
  },
  partition: ["awardId"],
});

// so we can query a user's awards by their user id
export const AwardByUserId = Award.index("AwardByUserId", {
  partition: ["userId"],
  sort: ["awardTime"],
});

export const Transaction = entity("Transaction", {
  attributes: {
    transactionId: z.string(),
    userId: z.string(),
    createdDate: z.string(),
  },
  partition: ["transactionId"],
});
