import { App } from "aws-cdk-lib";
import path from "path";
import { FoodOrderingStack } from "./food-ordering-stack";
import { WebsiteStack } from "./website-stack";

const app = new App();

const serviceStack = new FoodOrderingStack(app, "nextjs-site");
new WebsiteStack(app, "nextjs-website", {
  frontend: path.resolve(__dirname, "../../apps/frontend"),
  serviceStack: serviceStack,
});
