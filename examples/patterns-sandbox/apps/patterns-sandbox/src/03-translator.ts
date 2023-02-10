import { event, workflow } from "@eventual/core";

/**
 * Translator
 *
 * Use the message translator pattern to transform data format into a another one.
 *
 * Helps reduce coupling and simplify consumers.
 */

/**
 * Scenario
 *
 * Service A consumes sourceEvent from Service B
 * sourceEvent is emitted in the form { data: string }
 * where data is stringified json object like "{\"id\"": 1 }"
 *
 * Service B has two processes, one that saves the event into a database and another that starts a workflow.
 *
 * The workflow also needs the user name associated with the event.
 */

/**
 * Service B
 */

// an event from serviceB, outside of this context
const sourceEvent = event<{ data: string }>("serviceB.sourceEvent");

/**
 * Service A - our service
 *
 * We have subscribed by get sourceEvent from serviceB.
 */

// our events
const formattedEvent = event<{ id: number }>("formattedEvent");
const enrichedEvent = event<{ id: number; userId: string }>("enrichedEvent");

// our workflow needs the event id and user id
const processWorkflow = workflow(
  "processWorkflow",
  async (req: { id: number; userId: string }) => {}
);

declare function validate(data: string): boolean;
declare function getUser(eventId: number): Promise<string>;
declare function saveEvent(eventId: number): Promise<string>;

/**
 * Conformist
 *
 * Just consume an event as it comes in.
 */
sourceEvent.onEvent(async ({ data }) => {
  if (validate(data)) {
    const event = JSON.parse(data) as { id: number };
    const userId = await getUser(event.id);
    await processWorkflow.startExecution({ input: { id: event.id, userId } });
  }
});

sourceEvent.onEvent(async ({ data }) => {
  if (validate(data)) {
    const event = JSON.parse(data) as { id: number };
    await saveEvent(event.id);
  }
});

/**
 * New Protocol - Format the stringified json before consuming it.
 */

sourceEvent.onEvent(async ({ data }) => {
  if (validate(data)) {
    const event = JSON.parse(data) as { id: number };
    formattedEvent.publishEvents(event);
  }
});

formattedEvent.onEvent(async ({ id }) => {
  const userId = await getUser(id);
  await processWorkflow.startExecution({ input: { id, userId } });
});

formattedEvent.onEvent(async ({ id }) => {
  await saveEvent(id);
});

/**
 * New Entity - Erich the event with new information before consuming it.
 */

sourceEvent.onEvent(async ({ data }) => {
  if (validate(data)) {
    const event = JSON.parse(data) as { id: number };
    const userId = await getUser(event.id);
    enrichedEvent.publishEvents({ id: event.id, userId });
  }
});

enrichedEvent.onEvent(async ({ id, userId }) => {
  await processWorkflow.startExecution({ input: { id, userId } });
});

enrichedEvent.onEvent(async ({ id }) => {
  await saveEvent(id);
});
