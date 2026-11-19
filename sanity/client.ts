import "server-only";
import { createClient } from "next-sanity";
import { env } from "@/lib/config/env";

export const client = env.NEXT_PUBLIC_SANITY_PROJECT_ID
  ? createClient({
      projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: "2026-11-01",
      useCdn: true,
    })
  : null;
