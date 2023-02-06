# Eventual NextJS Example

## Deploying

### Deploying to CloudFlare

> npx wrangler login
> npx wrangler pages project create [pages project name]
> pnpm --filter frontend run export
> npx wrangler pages publish apps/frontend/out

Visit https://[pages project name].pages.dev/

### Deploying to S3/CloudFront

