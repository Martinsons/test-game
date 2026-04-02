/**
 * Downloads Wikipedia images for all places that have a wikiTitle.
 * Saves to public/images/places/ and writes lib/place-images.ts
 * with a name → local path map.
 *
 * Usage: node scripts/download-images.mjs
 */

import { mkdirSync, createWriteStream, existsSync, writeFileSync } from "fs";
import { pipeline } from "stream/promises";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/images/places");
const TS_OUT = path.join(__dirname, "../lib/place-images.ts");

mkdirSync(OUT_DIR, { recursive: true });

const PLACES = [
  // Cities
  { name: "Rīga",          wikiTitle: "Riga" },
  { name: "Daugavpils",    wikiTitle: "Daugavpils" },
  { name: "Liepāja",       wikiTitle: "Liepāja" },
  { name: "Jelgava",       wikiTitle: "Jelgava" },
  { name: "Jūrmala",       wikiTitle: "Jūrmala" },
  { name: "Ventspils",     wikiTitle: "Ventspils" },
  { name: "Rēzekne",       wikiTitle: "Rēzekne" },
  { name: "Valmiera",      wikiTitle: "Valmiera" },
  { name: "Jēkabpils",     wikiTitle: "Jēkabpils" },
  { name: "Ogre",          wikiTitle: "Ogre, Latvia" },
  // Towns
  { name: "Cēsis",         wikiTitle: "Cēsis" },
  { name: "Kuldīga",       wikiTitle: "Kuldīga" },
  { name: "Sigulda",       wikiTitle: "Sigulda" },
  { name: "Tukums",        wikiTitle: "Tukums" },
  { name: "Talsi",         wikiTitle: "Talsi" },
  { name: "Bauska",        wikiTitle: "Bauska" },
  { name: "Dobele",        wikiTitle: "Dobele" },
  { name: "Saldus",        wikiTitle: "Saldus" },
  { name: "Krāslava",      wikiTitle: "Krāslava" },
  { name: "Ludza",         wikiTitle: "Ludza" },
  { name: "Madona",        wikiTitle: "Madona, Latvia" },
  { name: "Gulbene",       wikiTitle: "Gulbene" },
  { name: "Balvi",         wikiTitle: "Balvi" },
  { name: "Alūksne",       wikiTitle: "Alūksne" },
  { name: "Limbaži",       wikiTitle: "Limbaži" },
  { name: "Smiltene",      wikiTitle: "Smiltene" },
  { name: "Preiļi",        wikiTitle: "Preiļi" },
  { name: "Līvāni",        wikiTitle: "Līvāni" },
  { name: "Aizkraukle",    wikiTitle: "Aizkraukle" },
  { name: "Aizpute",       wikiTitle: "Aizpute" },
  // POIs
  { name: "Gaizņkalns",                 wikiTitle: "Gaiziņkalns" },
  { name: "Kolkas rags",                wikiTitle: "Cape Kolka" },
  { name: "Rundāles pils",              wikiTitle: "Rundāle Palace" },
  { name: "Turaidas pils",              wikiTitle: "Turaida Castle" },
  { name: "Aglonas bazilika",           wikiTitle: "Aglona Basilica" },
  { name: "Ķemeru nacionālais parks",   wikiTitle: "Ķemeri National Park" },
  { name: "Slīteres nacionālais parks", wikiTitle: "Slītere National Park" },
  { name: "Engures ezers",              wikiTitle: "Engure Lake" },
  { name: "Rāznas ezers",              wikiTitle: "Rāzna" },
  { name: "Brīvības piemineklis",       wikiTitle: "Freedom Monument" },
  { name: "Liepājas karostas cietums",  wikiTitle: "Karosta Prison" },
];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[āä]/g, "a").replace(/č/g, "c").replace(/[ēé]/g, "e")
    .replace(/ģ/g, "g").replace(/ī/g, "i").replace(/ķ/g, "k")
    .replace(/ļ/g, "l").replace(/ņ/g, "n").replace(/š/g, "s")
    .replace(/ū/g, "u").replace(/ž/g, "z")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Uses curl via spawnSync (array args — no shell injection risk)
function curlDownload(url, dest) {
  const result = spawnSync("curl", [
    "-sSL",
    "--retry", "4",
    "--retry-delay", "8",
    "--retry-all-errors",
    "-A", "Latvia-Map-Game/1.0 (educational project)",
    "-o", dest,
    url,
  ]);
  if (result.status !== 0) {
    throw new Error(result.stderr?.toString() || `curl exited with ${result.status}`);
  }
}

const imageMap = {};

for (const place of PLACES) {
  const slug = slugify(place.wikiTitle);

  try {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place.wikiTitle)}`;
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": "Latvia-Map-Game/1.0 (educational project)" },
    });
    const data = await res.json();

    const imageUrl = data.originalimage?.source ?? data.thumbnail?.source;
    if (!imageUrl) {
      console.warn(`⚠  No image: ${place.name}`);
      continue;
    }

    const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
    const filename = `${slug}${ext}`;
    const dest = path.join(OUT_DIR, filename);
    const localPath = `/images/places/${filename}`;

    if (existsSync(dest)) {
      console.log(`✓  Skip (exists): ${filename}`);
    } else {
      curlDownload(imageUrl, dest);
      console.log(`✓  Downloaded: ${place.name} → ${filename}`);
    }

    imageMap[place.name] = localPath;
  } catch (err) {
    console.error(`✗  Failed: ${place.name} — ${err.message}`);
  }

  await sleep(2000);
}

// Write lib/place-images.ts
const lines = Object.entries(imageMap)
  .map(([name, p]) => `  ${JSON.stringify(name)}: ${JSON.stringify(p)},`)
  .join("\n");

writeFileSync(
  TS_OUT,
  `// Auto-generated by scripts/download-images.mjs — do not edit manually\nexport const PLACE_IMAGES: Record<string, string> = {\n${lines}\n};\n`
);

console.log(`\n✓ Written ${Object.keys(imageMap).length} entries to lib/place-images.ts`);
