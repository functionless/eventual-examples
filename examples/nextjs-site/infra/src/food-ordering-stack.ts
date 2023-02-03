import { Construct } from "constructs";
import { CfnOutput, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  Table,
  BillingMode,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import { Service } from "@eventual/aws-cdk";

export interface FoodOrderingStackProps extends StackProps {}

export class FoodOrderingStack extends Stack {
  public readonly service: Service;

  constructor(scope: Construct, id: string, props?: FoodOrderingStackProps) {
    super(scope, id, props);

    const table = new Table(this, "table", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    table.addLocalSecondaryIndex({
      indexName: "USER_TIME_ORDERS",
      sortKey: { name: "user_time", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.service = new Service(this, "nextjs-site", {
      name: "nextjs-site",
      entry: require.resolve("@nextjs-site/service"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(this.service.api.handler);
    table.grantReadWriteData(this.service);

    new CfnOutput(this, "nextjs-site-api-endpoint", {
      exportName: "nextjs-site-api-endpoint",
      value: this.service.api.gateway.url!,
    });

    new CfnOutput(this, "nextjs-site-event-bus-arn", {
      exportName: "nextjs-site-event-bus-arn",
      value: this.service.events.bus.eventBusArn,
    });
  }
}
