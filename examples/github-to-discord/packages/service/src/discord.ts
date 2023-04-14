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
 *    Manage Messages
 *    Send Messages
 */

export async function DiscordRequest<Body, Result>(
  endpoint: string,
  options: { body?: Body } & Omit<RequestInit, "body">
) {
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  // Stringify payloads
  const body = options.body ? JSON.stringify(options.body) : undefined;
  // Use node-fetch to make requests
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bot ${tokenSecret.getSecret()}`,
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
