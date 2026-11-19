const https = require("https");

const BASE_URL = "https://api.restcountries.com/countries/v5";
const API_KEY = process.env.API_KEY || "rc_live_43b6e00f29ab4f2eafdd8693d61be0ac";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "User-Agent": "Node.js",
          },
        },
        (res) => {
          let rawData = "";

          res.on("data", (chunk) => {
            rawData += chunk;
          });

          res.on("end", () => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(
                new Error(`HTTP ${res.statusCode}: ${rawData.slice(0, 200)}`)
              );
            }

            try {
              resolve(JSON.parse(rawData));
            } catch (err) {
              reject(new Error("Error parsing JSON: " + err.message));
            }
          });
        }
      )
      .on("error", (err) => {
        reject(err);
      });
  });
}

function normalizeCountry(c) {
  const firstCapital =
    Array.isArray(c.capitals) && c.capitals.length > 0
      ? c.capitals[0].name || "N/A"
      : "N/A";

  const languagesObj = {};
  if (Array.isArray(c.languages)) {
    c.languages.forEach((lang, idx) => {
      const key =
        lang.iso_639_3 || lang.iso_639_2 || lang.code || `lang_${idx}`;
      languagesObj[key] = lang.name || lang.native_name || "Unknown";
    });
  } else if (c.languages && typeof c.languages === "object") {
    Object.assign(languagesObj, c.languages);
  }

  return {
    name: {
      common: c.names?.common || "N/A",
      official: c.names?.official || c.names?.common || "N/A",
    },
    capital: firstCapital,
    subregion: c.subregion || "N/A",
    region: c.region || "N/A",
    population: c.population || 0,
    flags: {
      svg: c.flag?.url_svg || c.flag?.url_png || "./assets/world.png",
      png: c.flag?.url_png || c.flag?.url_svg || "./assets/world.png",
    },
    currencies: c.currencies || {},
    languages: languagesObj,
  };
}

async function getAllCountries() {
  const limit = 100;
  let offset = 0;
  let allCountries = [];
  let hasMore = true;

  const fields =
    "names.common,names.official,capitals,subregion,region,population,flag.url_svg,flag.url_png,currencies,languages";

  while (hasMore) {
    const url = `${BASE_URL}?limit=${limit}&offset=${offset}&response_fields=${encodeURIComponent(
      fields
    )}`;

    const json = await fetchJson(url);
    const objects = json?.data?.objects || [];
    allCountries = allCountries.concat(objects.map(normalizeCountry));

    const meta = json?.data?.meta;
    if (meta && typeof meta.more === "boolean") {
      hasMore = meta.more;
    } else {
      hasMore = objects.length === limit;
    }

    offset += limit;
  }

  return allCountries;
}

module.exports = { getAllCountries };