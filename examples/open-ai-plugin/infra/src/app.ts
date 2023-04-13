import { App, Stack, CfnOutput } from "aws-cdk-lib";
import { Service } from "@eventual/aws-cdk";

const app = new App();
const stack = new Stack(app, "open-ai-plugin");

import type * as open_ai_plugin from "@open-ai-plugin/service";

const service = new Service<typeof open_ai_plugin>(stack, "Service", {
  name: "open-ai-plugin",
  entry: require.resolve("@open-ai-plugin/service"),
  commands: {
    aiPluginJson: {
      
    }
  }
});
