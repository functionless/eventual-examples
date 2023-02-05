import { Construct } from "constructs";
import { CfnOutput, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  Table,
  BillingMode,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import { UserPool } from "aws-cdk-lib/aws-cognito";
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

    const userPool = new UserPool(this, "users", {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
    });
    const appClient = userPool.addClient("website", {
      disableOAuth: true,
      authFlows: { userPassword: true },
    });

    this.service = new Service(this, "nextjs-site", {
      name: "nextjs-site",
      entry: require.resolve("@nextjs-site/service"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    this.service.api.handlers.forEach((h) => table.grantReadWriteData(h));
    table.grantReadWriteData(this.service.activities.worker);

    new CfnOutput(this, "nextjs-site-api-endpoint", {
      exportName: "nextjs-site-api-endpoint",
      value: this.service.api.gateway.url!,
    });

    new CfnOutput(this, "nextjs-site-event-bus-arn", {
      exportName: "nextjs-site-event-bus-arn",
      value: this.service.events.bus.eventBusArn,
    });

    new CfnOutput(this, "nextjs-site-user-pool-id", {
      exportName: "nextjs-site-user-pool-id",
      value: userPool.userPoolId,
    });

    new CfnOutput(this, "nextjs-site-user-app-client-id", {
      exportName: "nextjs-site-user-app-client-id",
      value: appClient.userPoolClientId,
    });
  }
}
