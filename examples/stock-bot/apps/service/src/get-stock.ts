import { api, HttpResponse, duration } from "@eventual/core";

export const getStock = api.get(
  "/stock/:stockId",
  {
    memorySize: 512,
    handlerTimeout: duration(1, "minute"),
  },
  async () => {
    return new HttpResponse();
  }
);
