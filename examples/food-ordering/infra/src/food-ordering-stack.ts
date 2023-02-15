import { Construct } from "constructs";
import { CfnOutput, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  Table,
  BillingMode,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import { IUserPool, IUserPoolClient, UserPool } from "aws-cdk-lib/aws-cognito";
import { Service } from "@eventual/aws-cdk";

import type * as FoodOrderingService from "@food-ordering/service";

export interface FoodOrderingStackProps extends StackProps {}

export class FoodOrderingStack extends Stack {
  public readonly service: Service;
  public readonly userPool: IUserPool;
  public readonly userPoolClient: IUserPoolClient;

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

    this.userPool = new UserPool(this, "users", {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
    });

    this.userPoolClient = this.userPool.addClient("website", {
      disableOAuth: true,
      authFlows: { userPassword: true },
    });

    this.service = new Service<typeof FoodOrderingService>(
      this,
      "food-ordering",
      {
        name: "food-ordering",
        entry: require.resolve("@food-ordering/service"),
        environment: {
          TABLE_NAME: table.tableName,
        },
      }
    );

    this.service.api.handlers.forEach((h) => table.grantReadWriteData(h));
    table.grantReadWriteData(this.service.activities.worker);

    new CfnOutput(this, "food-ordering-api-endpoint", {
      exportName: "food-ordering-api-endpoint",
      value: this.service.api.gateway.url!,
    });

    new CfnOutput(this, "food-ordering-event-bus-arn", {
      exportName: "food-ordering-event-bus-arn",
      value: this.service.events.bus.eventBusArn,
    });

    new CfnOutput(this, "food-ordering-user-pool-id", {
      exportName: "food-ordering-user-pool-id",
      value: this.userPool.userPoolId,
    });

    new CfnOutput(this, "food-ordering-user-app-client-id", {
      exportName: "food-ordering-user-app-client-id",
      value: this.userPoolClient.userPoolClientId,
    });
  }
}
