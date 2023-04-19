import { AWSSecret } from "@eventual/aws-client";
import { JsonSecret } from "@eventual/core";
import {
  ChannelType,
  RESTGetAPICurrentUserGuildsResult,
  RESTGetAPIGuildChannelsResult,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageResult,
  RESTPostAPIGuildChannelJSONBody,
  RESTPostAPIGuildChannelResult,
} from "discord-api-types/v10";

// An AWS Secret is created in infra and the bot token is saved in AWS.
const tokenSecret = new JsonSecret<string>(
  new AWSSecret({
    secretId: process.env.DISCORD_BOT_TOKEN_SECRET_ARN!,
    cacheConfig: {
      enabled: false,
    },
  })
);

/**
 * Bot needs
 *    Manage Channels
 *    Send Messages
 */

export async function DiscordRequest<Body, Result>(
  endpoint: string,
  options: { body?: Body } & Omit<RequestInit, "body">
) {
  const token = await tokenSecret.getSecret();
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  // Stringify payloads
  const body = options.body ? JSON.stringify(options.body) : undefined;
  // Use node-fetch to make requests
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/eventual-examples/examples, 1.0.0)",
    },
    body,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res.json() as Result;
}

export async function sendDiscordMessage(message: string, channelId: string) {
  return DiscordRequest<
    RESTPostAPIChannelMessageJSONBody,
    RESTPostAPIChannelMessageResult
  >(`/channels/${channelId}/messages`, {
    method: "POST",
    body: {
      content: message,
    },
  });
}

export async function getServers() {
  return DiscordRequest<void, RESTGetAPICurrentUserGuildsResult>(
    `/users/@me/guilds`,
    {
      method: "GET",
    }
  );
}

export async function getChannels(guildId: string) {
  return DiscordRequest<void, RESTGetAPIGuildChannelsResult>(
    `/guilds/${guildId}/channels`,
    {
      method: "GET",
    }
  );
}

export async function createChannels(
  guildId: string,
  name: string,
  type: ChannelType.GuildText | ChannelType.GuildCategory,
  parentId?: string
) {
  return DiscordRequest<
    RESTPostAPIGuildChannelJSONBody,
    RESTPostAPIGuildChannelResult
  >(`/guilds/${guildId}/channels`, {
    method: "POST",
    body: {
      name,
      type,
      parent_id: parentId,
    },
  });
}

/**
 * Discord channel names (not category names) must be lower case, numbers, or a dash.
 * Dashes cannot lead or trail and cannot repeat without another character in between.
 *
 * Discord will do this mutation for us, but we want to:
 * 1. predict the resulting name to be able to find it later
 * 2. produce a more readable name than discord does.
 *
 * Formatting:
 * 1. All lower case
 * 2. All invalid characters are changed to dashes
 * 3. Remove duplicate, leading, or trailing dashes
 */
export function formatChannelName(name: string) {
  return (
    name
      .toLowerCase()
      // all non lowercase or numbers to dash
      .replace(/[^a-z0-9]/g, "-")
      // remove leading, trailing, and duplicate dashes
      .replace(/(^-*)|(-(?=-))|(-$)/g, "")
  );
}
