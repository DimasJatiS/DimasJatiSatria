import { getContent } from "@/lib/content/get";

export const revalidate = 3600;

/** `/cv.pdf` (PRD §7.1): the CV file uploaded in Sanity siteSettings, as a download. */
export async function GET() {
  const { settings } = await getContent("en");
  if (!settings.cvUrl) return new Response("CV not published yet", { status: 404 });
  return Response.redirect(`${settings.cvUrl}?dl=Dimas-Jati-Satria-CV.pdf`, 307);
}
