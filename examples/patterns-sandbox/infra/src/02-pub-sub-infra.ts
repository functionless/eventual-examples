import { Service } from "@eventual/aws-cdk";
import { aws_events, aws_events_targets, Stack } from "aws-cdk-lib";

declare const serviceA: Service;
declare const serviceB: Service;
declare const stack: Stack;

/**
 * Send Events Between Services
 */
new aws_events.Rule(stack, "Rule", {
  // send from service A
  eventBus: serviceA.events.bus,
  eventPattern: {
    // select all events with the name "MyEvent"
    detailType: ["MyEvent"],
  },
  targets: [
    // send to service B
    new aws_events_targets.EventBus(serviceB.events.bus),
  ],
});

serviceA.subscribe(stack, "", {
  service: serviceB,
  events: ["myEvent"],
});
