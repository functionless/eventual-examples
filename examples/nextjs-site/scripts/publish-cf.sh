# must have:
# wrangler installed 
# be logged into wranger/cf - npx wrangler login
# have created a cloudflare pages project - npx wrangler pages project create eventual-nextjs

pnpm --filter frontend run build
pnpm --filter frontend run export
npx wrangler pages publish apps/frontend/out