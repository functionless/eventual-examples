import { App } from "aws-cdk-lib";
import { FoodOrderingStack } from "./food-ordering-stack";

const app = new App();

new FoodOrderingStack(app, "nextjs-site");
