# SST 2.0 + Eventual Setup

## Install SST

> pnpm create sst@latest

## Add eventual Service

### 1 - Add Service Package

Create a new package in `packages` called `service`.

### 2 - Add package.json

```ts
{
  "name": "@[your service name]/service",
  "type": "module",
  "main": "lib/index.js",
  "module": "lib/index.js",
  "types": "lib/index.d.ts",
  "version": "0.0.0",
  "scripts": {
    "test": "jest --passWithNoTests"
  },
  "dependencies": {
    "@eventual/core": "^0.31.4"
  },
  "devDependencies": {
    "@eventual/testing": "^0.31.4",
    "esbuild": "^0.16.14",
    "jest": "^29",
    "ts-jest": "^29",
    "typescript": "^4.9.4"
  }
}
```

### 3 - add `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"],
  "compilerOptions": {
    "lib": ["DOM"],
    "outDir": "lib",
    "rootDir": "src",
    "target": "ES2021"
  }
}
```

### 4 - create `src/hello.ts`

This is where your eventual service code goes. For example:

```ts
import {} from "@eventual/core";

import { task, command, event, subscription, workflow } from "@eventual/core";

// create a REST API for: POST /hello <name>
export const hello = command("hello", async (name: string) => {
  const { executionId } = await helloWorkflow.startExecution({
    input: name,
  });

  return { executionId };
});

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

export interface HelloEvent {
  message: string;
}
```

### 5 - Create `src/index.ts`

Export the parts of your service you want to expose, for example

```ts
export * from "hello.js";
```

## Add Eventual Infra

At the top level of the repo

### 1 - Update GitIgnore

Add:

```ts
# eventual
.eventual

# typescript
*.tsbuildinfo
```

### 2 - Add `eventual.json`

```json
{
  "projectType": "aws-cdk",
  "synth": "pnpm run build",
  "deploy": "pnpm run deploy"
}
```

### 3 - Add to `devDependencies` in `package.json`

```json
"@aws-cdk/aws-apigatewayv2-alpha": "^2.50.0-alpha.0",
"@aws-cdk/aws-apigatewayv2-authorizers-alpha": "^2.50.0-alpha.0",
"@aws-cdk/aws-apigatewayv2-integrations-alpha": "^2.50.0-alpha.0",
"@eventual/aws-cdk": "^0.31.4",
"@eventual/cli": "^0.31.4",
"@tsconfig/node18": "^1",
"esbuild": "^0.16.14",
"@[your service name]/service": "workspace:^"
```

### 4 - Update TSConfig

```json
{
  "extends": "@tsconfig/node18/tsconfig.json",
  "files": [],
  "references": [
    {
      "path": "packages/service"
    }
  ]
}
```

### 5 - Add Watch Script to `package.json`

```json
"scripts": {
    ...,
    "watch": "tsc -b --watch",
}
```

### 6 - Add `tsconfig.base.json`

```json
{
  "extends": "@tsconfig/node18/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "esnext",
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,
    "types": ["@types/node", "@types/jest"]
  }
}
```

## Install

> pnpm install

(or `npm` or `yarn`)

## Start Eventual Local

> pnpm eventual local

## Deploy

> sst deploy
