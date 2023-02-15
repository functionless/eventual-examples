import { MiddlewareInput, MiddlewareOutput } from "@eventual/core";

/**
 * Middleware for injecting CORS headers in response.
 */
export async function cors<In>({
  next,
  context,
}: MiddlewareInput<In>): Promise<MiddlewareOutput<In>> {
  const response = await next(context);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Headers", "Authorization");
  return response;
}
