import { ApiSpecification, command } from "@eventual/core";
import type openapi from "openapi3-ts";

export const specificationJson = command(
  "specificationJson",
  { path: "/.well-known/openapi.json", method: "GET" },
  () => {
    return ApiSpecification.generate() satisfies openapi.OpenAPIObject;
  }
);
