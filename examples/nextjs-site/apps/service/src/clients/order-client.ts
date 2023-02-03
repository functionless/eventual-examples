import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Order, OrderStatus } from "@nextjs-site/core";
import { ulid } from "ulidx";

export interface OrderClientProps {
  dynamo: DynamoDBDocumentClient;
  tableName: string;
}

export class OrderClient {
  constructor(private props: OrderClientProps) {}

  /**
   * Create an order with the {@link OrderStatus} CREATED and return it's ID.
   */
  async createOrder(orderRequest: CreateOrderRequest): Promise<{ orderId: string }> {
    const order: Order = {
      ...orderRequest,
      id: ulid(),
      status: "CREATED",
      timestamp: new Date().toISOString(),
    };

    const orderRecord: OrderRecord = {
      ...order,
      pk: OrderRecord.partitionKey,
      sk: OrderRecord.sortKey(order.id),
      // the sort key we will use to order user records by timestamp
      user_time: OrderRecord.userTime(order.userId, order.timestamp),
    };

    await this.props.dynamo.send(
      new PutCommand({
        Item: orderRecord,
        TableName: this.props.tableName,
        ConditionExpression: "attribute_not_exists(sk)",
      })
    );

    return { orderId: orderRecord.id };
  }

  /**
   * Get all (up to 100 for now) order with a given user name.
   *
   * TODO: support getting all orders or all orders by store.
   * TODO: support pagination.
   */
  async getOrders(userId: string): Promise<Order[]> {
    const { Items } = await this.props.dynamo.send(
      new QueryCommand({
        TableName: this.props.tableName,
        IndexName: OrderRecord.userTimeIndex,
        KeyConditionExpression: "pk=:pk and begins_with(userId, :userId)",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":pk": OrderRecord.partitionKey,
        },
        ConsistentRead: true,
      })
    );

    return (Items as OrderRecord[]).map(orderFromRecord) ?? {};
  }

  /**
   * Update the status of an order.
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.props.dynamo.send(
      new UpdateCommand({
        TableName: this.props.tableName,
        Key: {
          pk: OrderRecord.partitionKey,
          sk: OrderRecord.sortKey(orderId),
        },
        UpdateExpression: "SET #status=:status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
        },
      })
    );
  }

  /**
   * Get a single order by ID.
   */
  async getOrder(orderId: string): Promise<Order | undefined> {
    const item = await this.props.dynamo.send(
      new GetCommand({
        Key: {
          pk: OrderRecord.partitionKey,
          sk: OrderRecord.sortKey(orderId),
        },
        TableName: this.props.tableName,
        ConsistentRead: true,
      })
    );

    return item.Item ? orderFromRecord(item.Item as OrderRecord) : undefined;
  }
}

export type CreateOrderRequest = Omit<Order, "id" | "status" | "timestamp">;

interface OrderRecord extends Order {
  pk: string;
  sk: string;
  // key used to order user orders within the secondary index.
  user_time: string;
}

const OrderRecord = {
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

function orderFromRecord(record: OrderRecord): Order {
  const { pk, sk, user_time, ...order } = record;
  return order;
}
