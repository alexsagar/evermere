import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "8nawnqp2",
    dataset: "development",
  },
  typegen: {
    path: "./src/**/*.{ts,tsx}",
    schema: "./sanity/schema.json",
    generates: "./src/sanity/types.ts",
  },
});
