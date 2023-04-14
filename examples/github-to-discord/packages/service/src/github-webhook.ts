import { command } from "@eventual/core";
import type {
  CreateEvent,
  PingEvent,
  WebhookEvent,
  WebhookEventName,
} from "@octokit/webhooks-types";
import {
  APIGuildCategoryChannel,
  APITextChannel,
  ChannelType,
} from "discord-api-types/v10";
import {
  createChannels,
  getChannels,
  getServers,
  sendDiscordMessage,
} from "./discord.js";

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
      // fan out an update to all connected discord servers
      await sendNewRepoResourceToServers(
        createEvent.repository.full_name,
        createEvent.ref_type,
        createEvent.ref
      );
    } else if (event.event_name === "ping") {
      const pingEvent = event as PingEvent;

      console.log("New Repo Connected", pingEvent.repository?.full_name);
    }
  }
);

async function sendNewRepoResourceToServers(
  repositoryName: string,
  resourceType: "tag" | "branch",
  resourceName: string
) {
  const servers = await getServers();
  // TODO: move this to a workflow to scale
  await Promise.all(
    servers.map(async (s) => {
      const channels = await getChannels(s.id);
      let repoCategory = channels.find(
        (s) =>
          s.name === "Eventual - Repos" && s.type === ChannelType.GuildCategory
      ) as APIGuildCategoryChannel | undefined;
      if (!repoCategory) {
        repoCategory = (await createChannels(
          s.id,
          "Eventual - Repos",
          ChannelType.GuildCategory
        )) as APIGuildCategoryChannel;
      }
      let repoChannel = channels.find(
        (s) =>
          s.name === repositoryName &&
          s.type === ChannelType.GuildText &&
          s.parent_id === repoCategory?.id
      );
      if (!repoChannel) {
        repoChannel = (await createChannels(
          s.id,
          repositoryName,
          ChannelType.GuildText,
          repoCategory?.id
        )) as APITextChannel;
      }
      await sendDiscordMessage(
        `${resourceType} created in repo ${repositoryName} - ${resourceName}`,
        repoChannel.id
      );
    })
  );
}
