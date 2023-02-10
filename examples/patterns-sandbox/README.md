# Welcome to your Eventual Project

## Project Structure
The following folder structure will be generated. 
```bash
├──infra # an AWS CDK application that deploys the repo's infrastructure
├──apps
    ├──patterns-sandbox # the NPM package containing the my-service business logic
├──packages
    ├──events # a shared NPM package containing event definitions
```

### `infra`

This is where you control what infrastructure is deployed with your Service, for example adding DynamoDB Tables, SQS Queues, or other stateful Resources.

### `apps/patterns-sandbox`

This is where you add business logic such as APIs, Event handlers, Workflows and Activities.

### `packages/events`

The `packages/` directory is where you can place any shared packages containing code that you want to use elsewhere in the repo, such as `apps/patterns-sandbox`.

The template includes an initial `events` package where you may want to place the type definitions of your events.

## Deployed Infrastructure

After deploying to AWS, you'll have a single stack named `patterns-sandbox` containing your Service. Take a look at the structure using the Resources view in CloudFormation. Here, you can find a list of all the Lambda Functions and other Resources that come with a Service.

See the [Service documentation](https://docs.eventual.net/reference/service) for more information.

### Noteworthy Lambda Functions

* `patterns-sandbox-api-handler` - the Lambda Function that handles any API routes, see [API](https://docs.eventual.net/reference/api).
* `patterns-sandbox-event-handler` - the Lambda Function that handles any Event subscriptions, see [Event](https://docs.eventual.net/reference/event).
* `patterns-sandbox-activity-handler` - the Lambda Function that handles any Activity invocations, see [Activity](https://docs.eventual.net/reference/activity).
* `patterns-sandbox-orchestrator-handler` - the Lambda Function that orchestrates Workflow Executions, see [Workflow](https://docs.eventual.net/reference/workflow).

### Viewing the Logs

The following CloudWatch LogGroups are useful for seeing what's happening in your Service.
* `patterns-sandbox-execution-logs` - contains a single LogStream per Workflow Execution containing all logs from the `workflow` and `activity` functions. This is a good place to see the logs for a single execution in one place, including any logs from a workflow and any activities it invokes.
* `patterns-sandbox-api-handler` - the API handler Lambda Function's logs, see [API](https://docs.eventual.net/reference/api).
* `patterns-sandbox-event-handler` - the Event handler Lambda Function's logs, see [Events](https://docs.eventual.net/reference/event)
* `patterns-sandbox-orchestrator` - system logs of the Workflow Orchestrator function.

## Scripts

The root `package.json` contains some scripts for your convenience.

### Build

The `build` script compiles all TypeScript (`.ts`) files in each package's `src/` directory and emits the compiled output in the corresponding `lib/` folder.

```
pnpm build
```

### Test

The `test` script runs `jest` in all sub-packages. Check out the apps/patterns-sandbox package for example tests.

```
pnpm test
```

### Watch

The `watch` script run the typescript compiler in the background and re-compiles `.ts` files whenever they are changed.
```
pnpm watch
```

### Synth

The `synth` script synthesizes the CDK application in the `infra/` package. 
```
pnpm synth
```

### Deploy

The `deploy` script synthesizes and deploys the CDK application in the `infra/` package to AWS.
```
pnpm run deploy
```

### Hotswap

The `hotswap` script synthesizes and deploys the CDK application in the `infra/` package to AWS using `cdk deploy --hotswap` which can bypass a slow CloudFormation deployment in cases where only the business logic in a Lambda Function has changed.
```
pnpm run deploy
```
