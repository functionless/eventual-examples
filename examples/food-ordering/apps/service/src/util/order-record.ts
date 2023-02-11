import { Order } from "@food-ordering/core";

export interface OrderRecord extends Order {
  pk: string;
  sk: string;
  // key used to order user orders within the secondary index.
  user_time: string;
}

export const OrderRecord = {
  partitionKey: "Order",
  sortKeyPrefix: "Order|",
  userTimeIndex: "USER_TIME_ORDERS",
  userTime: (userId: string, timestamp: string) => {
    return `${userId}|${timestamp}`;
  },
  sortKey: (orderId: string) => {
    return `${OrderRecord.sortKeyPrefix}${orderId}`;
  },
};

export function orderFromRecord(record: OrderRecord): Order {
  const { pk, sk, user_time, ...order } = record;
  return order;
}
