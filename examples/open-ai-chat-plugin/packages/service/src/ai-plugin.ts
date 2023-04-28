import { command } from "@eventual/core";
import { AIPluginManifest } from "./types.js";

export const aiPluginJson = command(
  "aiPluginJson",
  { path: "/.well-known/ai-plugin.json", method: "GET" },
  (_, { service: { serviceUrl } }) => {
    return {
      schema_version: "v1",
      name_for_human: "TODO Plugin",
      name_for_model: "todo",
      description_for_human:
        "Plugin for managing TODO list. You can add, remove and view your TODOs.",
      description_for_model:
        "Plugin for managing TODO list. You can add, remove and view your TODOs.",
      auth: {
        type: "none",
      },
      api: {
        type: "openapi",
        url: `${serviceUrl}/.well-known/openapi.json`,
        is_user_authenticated: false,
      },
      // logo_url: "http://localhost:3111/logo.png",
      contact_email: "support@example.com",
      legal_info_url: "http://www.example.com/legal",
    } satisfies AIPluginManifest;
  }
);
