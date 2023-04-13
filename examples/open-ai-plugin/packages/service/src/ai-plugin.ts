import { HttpResponse, api, command } from "@eventual/core";
import { AIPluginManifest } from "./types.js";

export const aiPluginJson = command(
  "aiPluginJson",
  { path: "/.well-known/ai-plugin.json", method: "GET" },
  () => {
    return new HttpResponse(
      JSON.stringify({
        schema_version: "v1",
        name_for_human: "TODO Plugin",
        name_for_model: "todo",
        description_for_human:
          "Plugin for managing a TODO list. You can add, remove and view your TODOs.",
        description_for_model:
          "Plugin for managing a TODO list. You can add, remove and view your TODOs.",
        auth: {
          type: "none",
        },
        api: {
          type: "openapi",
          url: "http://localhost:3111/openapi.yaml",
          is_user_authenticated: false,
        },
        logo_url: "http://localhost:3111/logo.png",
        contact_email: "support@example.com",
        legal_info_url: "http://www.example.com/legal",
      } satisfies AIPluginManifest)
    );
  }
);
