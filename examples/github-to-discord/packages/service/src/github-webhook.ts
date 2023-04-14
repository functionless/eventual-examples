import { command } from "@eventual/core";
import type {
  CreateEvent,
  PingEvent,
  WebhookEvent,
  WebhookEventName,
} from "@octokit/webhooks-types";

export const githubWebhook = command(
  "github-webhook",
  {
    path: "webhooks/gh",
    method: "POST",
    params: {
      event_name: { in: "header", name: "X-GitHub-Event" },
    },
  },
  async (event: WebhookEvent & { event_name: WebhookEventName }) => {
    console.debug(
      "Event Received",
      event.event_name,
      "repository" in event && event.repository
        ? event.repository?.full_name
        : "unknown source"
    );
    if (event.event_name === "create") {
      const createEvent = event as CreateEvent;

      console.debug(createEvent);
      console.log(
        "Tag or Branch Created",
        createEvent.ref_type,
        createEvent.ref
      );
    } else if (event.event_name === "ping") {
      const pingEvent = event as PingEvent;

      console.log("New Repo Connected", pingEvent.repository?.full_name);
    }
  }
);
