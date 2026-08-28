import { build } from "astro";

import { plausibleScriptSource } from "../src/lib/measurement.ts";
import { productionSiteOrigin } from "../src/lib/site-origin.ts";

const site = productionSiteOrigin(process.env.SITE_ORIGIN);
process.env.PLAUSIBLE_SCRIPT_SRC = plausibleScriptSource(
  process.env.PLAUSIBLE_SCRIPT_SRC,
);

await build({ site, mode: "launch-readiness" });
