/**
 * Borrowed from: https://github.com/transitive-bullshit/chatgpt-plugin-ts/blob/main/packages/chatgpt-plugin/src/types.ts
 */

export interface AIPluginManifest {
  schema_version: string;
  name_for_model: string;
  name_for_human: string;
  description_for_model: string;
  description_for_human: string;
  auth: AIPluginAuth;
  api: AIPluginAPI;
  logo_url: string;
  contact_email: string;
  legal_info_url: string;
}

export interface AIPluginAPI {
  type: string;
  url: string;
  is_user_authenticated: boolean;
}

export interface AIPluginAuth {
  type: string | "none";
  authorization_type?: string;
  authorization_url?: string;
  client_url?: string;
  scope?: string;
  authorization_content_type?: string;
  verification_tokens?: AIPluginVerificationTokens;
  instructions?: string;
}

export interface AIPluginVerificationTokens {
  openai: string;
}
