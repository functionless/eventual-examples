# Welcome to your Eventual Project

## Project Structure
The following folder structure will be generated. 
```bash
├──infra # an AWS CDK application that deploys the repo's infrastructure
├──packages
    ├──service # the NPM package containing the my-service business logic
```

### `infra`

This is where you control what infrastructure is deployed with your Service, for example adding DynamoDB Tables, SQS Queues, or other stateful Resources.

### `packages/service`

This is where you add business logic such as APIs, Event handlers, Workflows and Tasks.

## Deployed Infrastructure

After deploying to AWS, you'll have a single stack named `github-to-discord` containing your Service. Take a look at the structure using the Resources view in CloudFormation. Here, you can find a list of all the Lambda Functions and other Resources that come with a Service.

See the [Service documentation](https://docs.eventual.ai/reference/service) for more information.

## Scripts

The root `package.json` contains some scripts for your convenience.

### Build

The `build` script compiles all TypeScript (`.ts`) files in each package's `src/` directory and emits the compiled output in the corresponding `lib/` folder.

```
pnpm build
```

### Test

The `test` script runs `jest` in all sub-packages. Check out the packages/service package for example tests.

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
