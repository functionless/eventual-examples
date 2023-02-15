import { api } from "@eventual/core";
import { authorized } from "./auth.js";
import { cors } from "./cors.js";

export const publicAccess = api.use(cors);

export const privateAccess = api.use(cors).use(authorized);
