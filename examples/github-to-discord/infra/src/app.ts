import { App, Stack, CfnOutput } from "aws-cdk-lib";
import { Service } from "@eventual/aws-cdk";

const app = new App();
const stack = new Stack(app, "github-to-discord")

import type * as githubtodiscord from "@github-to-discord/service"

const service = new Service<typeof githubtodiscord>(stack, "Service", {
  name: "github-to-discord",
  entry: require.resolve("@github-to-discord/service")
});
