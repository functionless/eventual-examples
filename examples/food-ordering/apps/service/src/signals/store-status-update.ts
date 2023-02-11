import { signal } from "@eventual/core";

export type StoreStatus = "PREPARING" | "READY_FOR_PICKUP" | "ACCEPTED";

export interface StoreStatusUpdate {
  status: StoreStatus;
}

/**
 * Signal sent when a store updates the status.
 */
export const storeStatusUpdate = signal<StoreStatusUpdate>("StoreStatusUpdate");
