import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import type { NextRequest } from "next/server";
import { env } from "@/lib/config/env";
import { CONTENT_TAG } from "@/lib/content/get";

/** Sanity webhook (F-12): verifies the signature, then expires the content cache. */
export async function POST(req: NextRequest) {
  if (!env.SANITY_REVALIDATE_SECRET) return Response.json({ message: "Not configured" }, { status: 501 });
  try {
    const { isValidSignature } = await parseBody(req, env.SANITY_REVALIDATE_SECRET);
    if (!isValidSignature) return Response.json({ message: "Invalid signature" }, { status: 401 });
    revalidateTag(CONTENT_TAG, { expire: 0 });
    return Response.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error("[revalidate]", err);
    return Response.json({ message: "Bad request" }, { status: 400 });
  }
}
