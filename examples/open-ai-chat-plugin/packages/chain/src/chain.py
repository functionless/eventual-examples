from langchain.chat_models import ChatOpenAI
from langchain.agents import load_tools, initialize_agent
from langchain.agents import AgentType
from langchain.tools import AIPluginTool

tool = AIPluginTool.from_plugin_url("http://localhost:3111/.well-known/ai-plugin.json")

llm = ChatOpenAI(temperature=0)
tools = load_tools(["requests_all"] )
tools += [tool]

agent_chain = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)

"""
Warning:

In testing, langchain's agent would work when given the right prompts, but often had issues.
   * Often it would make up the plugin url instread of looking up the server[].uri in the openapi.json
   * When told the url, it would work sometimes, and other times it would make a request to an unknown endpoint instead
   * Even when told to lookup the plugin endpoint, it would hallucinate a fake public endpoint

I was able to get it to use all of the endpoints (GET todos, ADD todo, Delete Todo) with at least one prompt (below).
"""

## Get TODOs
# agent_chain.run("What TODO items are there using localhost:3111?")

## Delete TODO
# agent_chain.run("Can you mark the the buy groceries todo item as complete")

## Add TODO
agent_chain.run("create a todo item")