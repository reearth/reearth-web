import { test } from "vitest";

import { fetchGTFS } from "./gtfs";

test("with header", async () => {
  const features = await fetchGTFS({
    type: "gtfs",
    url: "https://api.odpt.org/api/v4/gtfs/realtime/ToeiBus?acl:consumerKey=e14eb9a1b06d9c3933ff4f4bd953c02b348ce9c67d59a5150a4c3388d6e23337",
  });

  console.log("features: ", features);
});
