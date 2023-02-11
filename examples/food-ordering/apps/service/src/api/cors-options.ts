// for testing

import { api, HttpResponse } from "@eventual/core";

// TODO: support
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization",
};

export class CorsInjectedHttpResponse extends HttpResponse {
  constructor(
    body: string | undefined,
    init: {
      status: number;
      statusText?: string;
      headers?: Record<string, string> | Headers;
    }
  ) {
    super(body, {
      ...init,
      headers: {
        ...cors,
        ...init.headers,
      },
    });
  }
}

export const options = api.options("*", async () => {
  return new CorsInjectedHttpResponse(undefined, { status: 200 });
});
