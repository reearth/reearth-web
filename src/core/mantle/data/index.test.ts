import { test } from "vitest";

import { fetchData } from ".";

test("with header", async () => {
  const features = await fetchData({
    type: "georss",
    url: "https://dl.dropboxusercontent.com/s/gmna8hrscyn7s0q/combineGeometry.xml?dl=0",
  });

  console.log("features: ", features);
}, 10000);
