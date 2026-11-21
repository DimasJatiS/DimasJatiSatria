// Creates the Sanity webhook that revalidates the site (idempotent). Run from studio/:
// SITE_URL=https://… HOOK_SECRET=… pnpm exec sanity exec scripts/create-webhook.ts --with-user-token
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2021-10-04", useProjectHostname: false });
const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;
const existing = await client.request<{ name: string }[]>({ url: `/hooks/projects/${projectId}` });
if (existing.some((h) => h.name === "Revalidate portfolio")) {
  console.log("hook already exists");
} else {
  await client.request({
    url: `/hooks/projects/${projectId}`,
    method: "POST",
    body: {
      type: "document",
      name: "Revalidate portfolio",
      url: `${process.env.SITE_URL}/api/revalidate`,
      httpMethod: "POST",
      apiVersion: "v2026-11-01",
      dataset: process.env.SANITY_STUDIO_DATASET,
      includeDrafts: false,
      secret: process.env.HOOK_SECRET,
      rule: { on: ["create", "update", "delete"], filter: '_type in ["siteSettings","project","activity","skillGroup"]', projection: "{_type}" },
    },
  });
  console.log("hook created");
}
