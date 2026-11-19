// Clash Display (ITF Free Font License) may not be committed to a public repo,
// so it is downloaded from Fontshare before dev/build. Fails loudly on purpose.
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";

const out = new URL("../app/fonts/ClashDisplay-Variable.woff2", import.meta.url);
if (existsSync(out)) process.exit(0);

const css = await (await fetch("https://api.fontshare.com/v2/css?f[]=clash-display@1&display=swap")).text();
const match = css.match(/url\('([^']+\.woff2)'\)/);
if (!match) throw new Error("fetch-fonts: no woff2 URL in the Fontshare CSS for Clash Display");
const res = await fetch(`https:${match[1]}`);
if (!res.ok) throw new Error(`fetch-fonts: download failed (${res.status})`);
await mkdir(new URL(".", out), { recursive: true });
await writeFile(out, Buffer.from(await res.arrayBuffer()));
console.log("fetch-fonts: Clash Display downloaded");
