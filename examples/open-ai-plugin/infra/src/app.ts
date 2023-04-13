import { App, Stack, CfnOutput } from "aws-cdk-lib";
import { Service } from "@eventual/aws-cdk";

const app = new App();
const stack = new Stack(app, "open-ai-plugin");

import type * as open_ai_plugin from "@open-ai-plugin/service";

const service = new Service<typeof open_ai_plugin>(stack, "Service", {
  name: "open-ai-plugin",
  entry: require.resolve("@open-ai-plugin/service"),
  openApi: {
    info: {
      title: "TODO Plugin",
  ````description: `A plugin that allows the user to create and manage a TODO list using ChatGPT. If you do not know the user's username, ask them first before making queries to the plugin. Otherwise, use the username "global"`,
      version: "v1"
    }
  }
});
