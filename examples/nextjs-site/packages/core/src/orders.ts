export type OrderStatus =
  | "CREATED"
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "IN_ROUTE"
  | "DELIVERED";

export interface Order {
  id: string;
  userId: string;
  timestamp: string;
  address: string;
  store: string;
  items: Item[];
  status: OrderStatus;
}

export interface Item {
  id: string;
  name: string;
  quantity: string;
  details: string;
}

export type CreateOrderRequest = Omit<Order, "id" | "status" | "timestamp">;
/**
 * Used by the API when there is an auth token present.
 */
export type CreateOrderRequestWithoutUser = Omit<CreateOrderRequest, "userId">;

export interface CreateOrderResult {
  orderId: string;
}
