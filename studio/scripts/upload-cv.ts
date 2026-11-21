// Upload a CV PDF to siteSettings.cv (served at /cv.pdf).
// Run from studio/: `CV_PATH=/abs/path/cv.pdf pnpm exec sanity exec scripts/upload-cv.ts --with-user-token`.
import { createReadStream, statSync } from "node:fs";
import { getCliClient } from "sanity/cli";

const path = process.env.CV_PATH;
if (!path?.endsWith(".pdf")) throw new Error("Set CV_PATH to a .pdf file");
if (statSync(path).size > 500_000) throw new Error("CV is over 500 KB");

const client = getCliClient({ apiVersion: "2026-11-01" });
const asset = await client.assets.upload("file", createReadStream(path), { filename: "Dimas-Jati-Satria-CV.pdf", contentType: "application/pdf" });
await client.patch("siteSettings").set({ cv: { _type: "file", asset: { _type: "reference", _ref: asset._id } } }).commit();
console.log(`siteSettings.cv -> ${asset.url}`);
