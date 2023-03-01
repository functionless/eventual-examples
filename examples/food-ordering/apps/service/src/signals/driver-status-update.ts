import { signal } from "@eventual/core";

export type DriverStatus = "IN_ROUTE" | "DELIVERED";

export interface DriverStatusUpdate {
  status: DriverStatus;
}

export const driverStatusUpdate =
  signal<DriverStatusUpdate>("DriverStatusUpdate");
