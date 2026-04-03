// scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const places = [
  // Cities
  { name: "Rīga",          lat: 56.9496, lng: 24.1052, hint: "Galvaspilsēta",                   category: "city", image: "/images/places/riga.jpg" },
  { name: "Daugavpils",    lat: 55.8749, lng: 26.5356, hint: "Otrā lielākā pilsēta",              category: "city", image: "/images/places/daugavpils.JPG" },
  { name: "Liepāja",       lat: 56.5047, lng: 21.0107, hint: "Pilsēta, kur pūš vējš",            category: "city", image: "/images/places/liepaja.jpg" },
  { name: "Jelgava",       lat: 56.6511, lng: 23.7134, hint: "Zemgales galvaspilsēta",            category: "city", image: "/images/places/jelgava.jpg" },
  { name: "Jūrmala",       lat: 56.9680, lng: 23.7704, hint: "Kūrortpilsēta",                    category: "city", image: "/images/places/jurmala.png" },
  { name: "Ventspils",     lat: 57.3942, lng: 21.5647, hint: "Ostas pilsēta",                    category: "city", image: "/images/places/ventspils.jpg" },
  { name: "Rēzekne",       lat: 56.5099, lng: 27.3340, hint: "Latgales sirds",                   category: "city", image: "/images/places/rezekne.jpg" },
  { name: "Valmiera",      lat: 57.5384, lng: 25.4263, hint: "Pilsēta pie Gaujas",               category: "city", image: "/images/places/valmiera.jpg" },
  { name: "Jēkabpils",     lat: 56.4995, lng: 25.8606, hint: "Pilsēta pie Daugavas",             category: "city", image: "/images/places/jekabpils.jpg" },
  { name: "Ogre",          lat: 56.8166, lng: 24.6047, hint: "Pilsēta netālu no Rīgas",          category: "city", image: "/images/places/ogre-latvia.jpg" },
  // Towns
  { name: "Cēsis",         lat: 57.3119, lng: 25.2748, hint: "Viduslaiku pilsēta",               category: "town", image: "/images/places/cesis.jpg" },
  { name: "Kuldīga",       lat: 56.9677, lng: 21.9681, hint: "Ventas rumba",                     category: "town", image: "/images/places/kuldiga.jpg" },
  { name: "Sigulda",       lat: 57.1514, lng: 24.8514, hint: "Latvijas Šveice",                  category: "town", image: "/images/places/sigulda.png" },
  { name: "Tukums",        lat: 56.9668, lng: 23.1526, hint: "Pilsēta Zemgalē",                  category: "town", image: "/images/places/tukums.jpg" },
  { name: "Talsi",         lat: 57.2455, lng: 22.5815, hint: "Deviņu pakalnu pilsēta",           category: "town", image: "/images/places/talsi.jpg" },
  { name: "Bauska",        lat: 56.4079, lng: 24.1944, hint: "Pilsēta pie Lielupes sākuma",      category: "town", image: "/images/places/bauska.jpg" },
  { name: "Dobele",        lat: 56.6254, lng: 23.2793, hint: "Ceriņu pilsēta",                   category: "town", image: "/images/places/dobele.jpg" },
  { name: "Saldus",        lat: 56.6636, lng: 22.4888, hint: "Pilsēta Kurzemē",                  category: "town", image: null },
  { name: "Krāslava",      lat: 55.8951, lng: 27.1681, hint: "Pilsēta pie Daugavas Latgalē",     category: "town", image: "/images/places/kraslava.jpg" },
  { name: "Ludza",         lat: 56.5467, lng: 27.7192, hint: "Viena no vecākajām pilsētām",      category: "town", image: "/images/places/ludza.jpg" },
  { name: "Madona",        lat: 56.8538, lng: 26.2173, hint: "Vidzemes augstienes pilsēta",      category: "town", image: "/images/places/madona-latvia.jpg" },
  { name: "Gulbene",       lat: 57.1749, lng: 26.7527, hint: "Bānītis",                          category: "town", image: "/images/places/gulbene.jpg" },
  { name: "Balvi",         lat: 57.1314, lng: 27.2658, hint: "Pilsēta Ziemeļlatgalē",            category: "town", image: "/images/places/balvi.jpg" },
  { name: "Alūksne",       lat: 57.4225, lng: 27.0484, hint: "Ezera pilsēta Vidzemē",            category: "town", image: "/images/places/aluksne.jpg" },
  { name: "Limbaži",       lat: 57.5136, lng: 24.7135, hint: "Pilsēta Vidzemē",                  category: "town", image: "/images/places/limbazi.jpg" },
  { name: "Smiltene",      lat: 57.4242, lng: 25.9014, hint: "Pilsēta Vidzemē",                  category: "town", image: "/images/places/smiltene.jpg" },
  { name: "Preiļi",        lat: 56.2942, lng: 26.7246, hint: "Pilsēta Latgalē",                  category: "town", image: "/images/places/preili.JPG" },
  { name: "Līvāni",        lat: 56.3540, lng: 26.1756, hint: "Stikla pilsēta",                   category: "town", image: "/images/places/livani.jpg" },
  { name: "Aizkraukle",    lat: 56.6048, lng: 25.2551, hint: "Pilsēta pie Daugavas",             category: "town", image: "/images/places/aizkraukle.png" },
  { name: "Aizpute",       lat: 56.7180, lng: 21.6013, hint: "Pilsēta Kurzemē",                  category: "town", image: "/images/places/aizpute.jpg" },
  // Points of interest
  { name: "Gaizņkalns",                 lat: 57.0847, lng: 25.9667, hint: "Augstākais kalns Latvijā (312 m)",          category: "poi", image: "/images/places/gaizinkalns.jpg" },
  { name: "Kolkas rags",                lat: 57.7559, lng: 22.5934, hint: "Kur satiekas Baltijas jūra un Rīgas līcis", category: "poi", image: "/images/places/cape-kolka.jpg" },
  { name: "Rundāles pils",              lat: 56.4133, lng: 24.0241, hint: "Baroka stila pils",                         category: "poi", image: "/images/places/rundale-palace.jpg" },
  { name: "Turaidas pils",              lat: 57.1849, lng: 24.8478, hint: "Sarkanā pils Siguldas tuvumā",              category: "poi", image: "/images/places/turaida-castle.JPG" },
  { name: "Aglonas bazilika",           lat: 56.1327, lng: 27.0045, hint: "Katoļu svētvieta Latgalē",                  category: "poi", image: null },
  { name: "Ķemeru nacionālais parks",   lat: 56.9167, lng: 23.4833, hint: "Purvi un sēravoti",                         category: "poi", image: "/images/places/kemeri-national-park.JPG" },
  { name: "Slīteres nacionālais parks", lat: 57.6333, lng: 22.2833, hint: "Dabas parks Ziemeļkurzemē",                 category: "poi", image: "/images/places/slitere-national-park.jpg" },
  { name: "Engures ezers",              lat: 57.1833, lng: 23.1333, hint: "Lielākais piekrastes ezers",                category: "poi", image: "/images/places/engure-lake.jpg" },
  { name: "Rāznas ezers",               lat: 56.3167, lng: 27.4500, hint: "Latgales lielākais ezers",                  category: "poi", image: null },
  { name: "Brīvības piemineklis",       lat: 56.9514, lng: 24.1132, hint: "Milda — Rīgas simbols",                     category: "poi", image: "/images/places/freedom-monument.jpg" },
  { name: "Liepājas karostas cietums",  lat: 56.5556, lng: 20.9833, hint: "Vēsturisks militārs cietums",               category: "poi", image: null },
];

const { error } = await supabase
  .from("places")
  .upsert(places, { onConflict: "name" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log(`Seeded ${places.length} places successfully.`);
