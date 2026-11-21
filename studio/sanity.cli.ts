import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: { projectId: process.env.SANITY_STUDIO_PROJECT_ID, dataset: process.env.SANITY_STUDIO_DATASET ?? "production" },
  // `pnpm deploy` publishes the Studio at https://dimasjati.sanity.studio (login with the owner's Sanity account).
  studioHost: "dimasjati",
  deployment: { appId: "c9kxwdfionfd7saiafca29cj" },
});
