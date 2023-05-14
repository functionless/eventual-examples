import { StackContext, Api } from "sst/constructs";
import { Service } from "@eventual/aws-cdk";
import type approval_sst from "@approval_sst/service";
import { Tags } from "aws-cdk-lib";

export function API({ stack }: StackContext) {
  const service = new Service<typeof approval_sst>(stack, "Service", {
    name: "approval_sst",
    entry: require.resolve("@approval_sst/service"),
  });

  const gatewayTags = Tags.of(service.gateway);
  gatewayTags.remove("sst:stage");
  gatewayTags.remove("sst:app");

  stack.addOutputs({
    ApiEndpoint: service.gateway.apiEndpoint,
  });
}
