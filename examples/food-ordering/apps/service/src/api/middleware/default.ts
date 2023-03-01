import { api } from "@eventual/core";
import { authorized } from "./auth.js";

export const publicAccess = api;

export const privateAccess = api.use(authorized);
