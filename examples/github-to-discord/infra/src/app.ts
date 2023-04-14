import { Service } from "@eventual/aws-cdk";
import { App, Stack } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

const app = new App();
const stack = new Stack(app, "github-to-discord");

import type * as githubtodiscord from "@github-to-discord/service";

const secret = new Secret(stack, "discord-bot-secret");

const service = new Service<typeof githubtodiscord>(stack, "Service", {
  name: "github-to-discord",
  entry: require.resolve("@github-to-discord/service"),
  environment: {
    DISCORD_BOT_TOKEN_SECRET_ARN: secret.secretArn,
  },
});

secret.grantRead(service.commands["github-webhook"]);
