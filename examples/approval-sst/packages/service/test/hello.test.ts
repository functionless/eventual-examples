import { Execution, ExecutionStatus } from "@eventual/core";
import { TestEnvironment } from "@eventual/testing";
import { createRequire } from "module";
import { helloWorkflow } from "../src/index.js";

const require = createRequire(import.meta.url);

let env: TestEnvironment;

// if there is pollution between tests, call reset()
beforeAll(async () => {
  env = new TestEnvironment();
});

test("hello workflow should emit helloEvent and return message", async () => {
  const execution = await env.startExecution({
    workflow: helloWorkflow,
    input: "name",
  });

  expect((await execution.getStatus()).status).toEqual(
    ExecutionStatus.IN_PROGRESS
  );

  await env.tick();

  expect(await execution.getStatus()).toMatchObject<Partial<Execution<string>>>(
    {
      status: ExecutionStatus.SUCCEEDED,
      result: "hello name",
    }
  );
});
