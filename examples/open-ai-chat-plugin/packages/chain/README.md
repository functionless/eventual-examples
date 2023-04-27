This package contains examples of how to use eventual with langchain.

It includes both a python and typescript example, however, the typescript example doesn't work at all using langchainjs 0.0.64.

Python also has issues, covered in detail in ./src/chain.py.

## Python Setup and Running

Terminal 1:
```sh
$ cd /examples/open-ai-chat-plugin
$ pnpm eventual local
```

Terminal 2:
```sh
$ cd /examples/open-ai-chat-plugin/packages/chain
$ pip3 install langchain openai
$ OPENAI_API_TOKEN=[your token] python ./src/chain.py
```

## Typescript Setup and running

Terminal 1:
```sh
$ cd /examples/open-ai-chat-plugin
$ pnpm eventual local
```

Terminal 2:
```sh
cd /examples/open-ai-chat-plugin/packages/chain
ts-node ./src/index.ts
```