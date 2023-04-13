import { task, command, event, subscription, workflow } from "@eventual/core";

// create a REST API for: POST /hello <name>
export const hello = command("hello", async (name: string) => {
  const { executionId } = await helloWorkflow.startExecution({
    input: name,
  });

  return { executionId };
})

export const helloWorkflow = workflow("helloWorkflow", async (name: string) => {
  // call a task to format the message
  const message = await formatMessage(name);

  // emit the message to the helloEvent
  await helloEvent.emit({
    message,
  });

  // return the message we created
  return message;
});

// a task that does the work of formatting the message
export const formatMessage = task("formatName", async (name: string) => {
  return `hello ${name}`;
});

export const helloEvent = event<HelloEvent>("HelloEvent");

export const onHelloEvent = subscription(
  "onHelloEvent",
  {
    events: [helloEvent],
  },
  async (hello) => {
    console.log("received event", hello);
  }
);

export interface HelloEvent {
  message: string;
}
