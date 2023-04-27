import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  AIPluginTool,
  RequestsGetTool,
  RequestsPostTool,
} from "langchain/tools";


/**
 * Note: the typescript Plugin API with langchain does not seem to work as of version 0.0.64.
 *       it finds the plugin, but does not use it.
 *       python works better.
 */

// export const run = async () => {
const tools = [
  new RequestsGetTool(),
  new RequestsPostTool(),
  await AIPluginTool.fromPluginUrl(
    "http://localhost:3111/.well-known/ai-plugin.json"
  ),
];
const agent = await initializeAgentExecutorWithOptions(
  tools,
  new ChatOpenAI({ temperature: 0 }),
  { agentType: "chat-zero-shot-react-description", verbose: true }
);

const result = await agent.call({
  input: "ask the TODO plugin to remember to publish a blog post",
});

console.log({ result });
// };
