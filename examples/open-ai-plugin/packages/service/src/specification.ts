import { HttpResponse, api, command } from "@eventual/core";
import { AIPluginManifest } from "./types.js";

export const aiPluginJson = command(
  "specification",
  { path: "/.well-known/ai-plugin.json", method: "GET" },
  () => {
    return new HttpResponse(
      JSON.stringify("TODO, get the spec from ApiSpecification")
    );
  }
);
