import { event } from "@eventual/core";

export interface HelloEvent {
  message: string;
}

export const helloEvent = event<HelloEvent>("HelloEvent");
