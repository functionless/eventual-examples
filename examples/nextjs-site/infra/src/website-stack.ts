import {
  CfnOutput,
  DockerImage,
  Duration,
  RemovalPolicy,
  Stack,
} from "aws-cdk-lib";
import {
  AllowedMethods,
  Distribution,
  OriginAccessIdentity,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CanonicalUserPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { execSync } from "child_process";
import { Construct } from "constructs";
import { FoodOrderingStack } from "./food-ordering-stack";

export interface WebsiteStackProps {
  frontend: string;
  serviceStack: FoodOrderingStack;
}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id);
    const cloudfrontOAI = new OriginAccessIdentity(this, "cloudfront-OAI", {
      comment: `OAI for ${id}`,
    });

    const bucket = new Bucket(this, "bucket", {
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: "index.html",
    });

    bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [
          new CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const distribution = new Distribution(this, "SiteDistribution", {
      defaultRootObject: "index.html",
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: cloudfrontOAI,
        }),
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    const apiString = new StringParameter(this, "apiEndpoint", {
      stringValue: props.serviceStack.service.api.gateway.url!,
    });
    const userPoolId = new StringParameter(this, "userPoolId", {
      stringValue: props.serviceStack.userPool.userPoolId,
    });
    const userPoolClientId = new StringParameter(this, "userPoolClientId", {
      stringValue: props.serviceStack.userPoolClient.userPoolClientId,
    });

    new BucketDeployment(this, "DeployWithInvalidation", {
      sources: [
        Source.asset(props.frontend, {
          bundling: {
            image: DockerImage.fromRegistry("dummy"),
            local: {
              tryBundle: (outdir) => {
                const buildCommand = `cd ${props.frontend} && npx next build`;
                const exportCommand = `cd ${props.frontend} && npx next export -o ${outdir}`;
                console.log("building with", buildCommand);
                execSync(buildCommand);
                console.log("exporting with", exportCommand);
                execSync(exportCommand);
                return true;
              },
            },
          },
        }),
        Source.jsonData("env_override.json", {
          eventualApi: apiString.stringValue,
          userPoolId: userPoolId.stringValue,
          userPoolClientId: userPoolClientId.stringValue,
        }),
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new CfnOutput(this, "website-domain", {
      value: distribution.distributionDomainName,
    });
  }
}

export interface Content {
  readonly text: string;
  readonly markers: Record<string, any>;
}
