# Github to Discord Example

In this example, we'll write a custom message to a discord server when a new Tag or Branch is created in a GitHub repo.

## Setup and Testing

Note: For this example, we cannot use the [Eventual local development server](https://docs.eventual.ai/how-to/run-locally) because we need to consume real events from github.

1. Deploy
2. Discord Bot Setup
3. Github Test Repo
4. Test

### Prerequisites

1. AWS Account
2. `aws` CLI
3. `aws` CLI is configured
4. Discord Account
5. Github Account
6. Github Repo that you own (can be empty)
7. `git` CLI installed locally

### Deploy to AWS

First, deploy the service to AWS by running:

```bash
$ pnpm run deploy --require-approval never
```

Note: if you want to deploy to a different profile, make sure you provide it with the `--deploy` flag.

### Discord Bot Setup

Follow the bot setup (step 1) [here](https://discord.com/developers/docs/getting-started#step-1-creating-an-app).

#### Token Secret

We need to make the bot token accessible to our service.

1. Find the token generated above (or create a new one)
2. Navigate to the AWS Secret Manager
3. Find the secret created during the deployment, should be called `discordbotsecret` with some numbers after it.
4. Set the token as the string value with quotes around it. ex: `"[your bot token]"`.

#### Install Bot

Ensure you give the app `bot` permissions with `Send Messages` and `Manage Channels` scopes.

Invite the bot into a discord server that you can write to.

### Github Test Repo

Now we need to configure one or more github repos that will send events to our service.

Run `pnpm eventual show service` to get the `API Gateway`. You'll need this later.

Navigate to a github repo that you can push to, or create a new one.

In the repo: 
1. Go to `settings` > `webhooks`. Create a new webhook. 
2. Set the `url` to `[API Gateway]/webhooks/gh` - This is the command url created by the eventual service.
3. Change the format to `application/json`
4. Choose to select specific events to send and pick only `Branch or tag creation`.
5. Save

### Test

Now the service is all setup. To review, you have an Eventual Service with one webhook/command, a discord bot, and a github repo that writes publishes new tag and branch creation to your service.

To test, we just need to push tags to the repo.

Go to your guthub repo locally or clone the repo locally.

Run:

```bash
git tag -a testTag -m "I am a test tag"
git push --tags
```

You should quickly see a new channel and message in your discord server that the bot was installed into.

