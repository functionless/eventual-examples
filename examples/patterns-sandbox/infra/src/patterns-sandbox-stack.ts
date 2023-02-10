import { Construct } from "constructs";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Service } from "@eventual/aws-cdk";

export interface MyServiceStackProps extends StackProps {}

export class MyServiceStack extends Stack {
  public readonly service: Service;

  constructor(scope: Construct, id: string, props?: MyServiceStackProps) {
    super(scope, id, props);

    this.service = new Service(this, "patterns-sandbox", {
      name: "patterns-sandbox",
      entry: require.resolve("patterns-sandbox")
    });

    new CfnOutput(this, "patterns-sandbox-api-endpoint", {
      exportName: "patterns-sandbox-api-endpoint",
      value: this.service.api.gateway.url!,
    });

    new CfnOutput(this, "patterns-sandbox-event-bus-arn", {
      exportName: "patterns-sandbox-event-bus-arn",
      value: this.service.events.bus.eventBusArn,
    });
  }
}
