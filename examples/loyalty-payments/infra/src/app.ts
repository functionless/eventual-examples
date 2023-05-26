import { App, Stack, CfnOutput } from "aws-cdk-lib";
import { Service } from "@eventual/aws-cdk";

const app = new App();
const stack = new Stack(app, "loyalty-payments")

import type * as loyaltypayments from "@loyalty-payments/service"

const service = new Service<typeof loyaltypayments>(stack, "Service", {
  name: "loyalty-payments",
  entry: require.resolve("@loyalty-payments/service")
});
