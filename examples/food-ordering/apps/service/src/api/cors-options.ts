// for testing

import { HttpResponse } from "@eventual/core";
import { publicAccess } from "./middleware/default.js";

export const options = publicAccess.options("*", async () => {
  return new HttpResponse(undefined, {
    status: 200,
  });
});
