import {
  activity,
  api,
  ApiResponse,
  event,
  EventualServiceClient,
  workflow,
} from "@eventual/core";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

/**
 * Pub/Sub
 */

/**
 * Define
 */

const myEvent = event<{ data: string }>("MyEvent");

/**
 * Subscribe
 */

myEvent.onEvent(async (event) => {
  console.log();
});

/**
 * Service to Service subscriptions happen at the infra layer.
 * See infra/src/02-pub-sub-infra.ts
 */

/**
 * Publish - Internal
 *
 * Events can be published by the service to internal or external consumers.
 */

// an API publishing an event
api.post("/send", async () => {
  await myEvent.publishEvents({ data: "hi" });
  return new ApiResponse();
});

// an event subscription emitting an event
myEvent.onEvent(async () => {
  await myEvent.publishEvents({ data: "hi" });
});

// a workflow that publishes an event as a step.
workflow("myWorkflow", async () => {
  await myEvent.publishEvents({ data: "hi" });
});

/**
 * Publish - External
 *
 * Event can be published to the service from external actors.
 */

declare const serviceClient: EventualServiceClient;

// this activity uses an instance of the eventual client to publish an event to another service.
activity("sendEventToService", async () => {
  await serviceClient.publishEvents({
    events: [
      {
        event: { data: "hi" },
        name: "myEvent",
      },
    ],
  });
});

// using the event bus arn, IAM permission to putEvents and the definition of the event, an external service
// can use the event bridge client.
declare const otherServiceBusArn: string;
declare const eventBus: EventBridgeClient;
activity("sendEventToService", async () => {
  await eventBus.send(
    new PutEventsCommand({
      Entries: [
        {
          DetailType: "myEvent",
          Detail: JSON.stringify({ data: "hi" }),
          // the ARN of the Event Bus that belongs to `myService`
          EventBusName: otherServiceBusArn,
        },
      ],
    })
  );
});
