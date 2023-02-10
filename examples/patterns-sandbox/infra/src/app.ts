import { App } from "aws-cdk-lib";
import { MyServiceStack } from "./patterns-sandbox-stack";

const app = new App();

new MyServiceStack(app, "patterns-sandbox");
