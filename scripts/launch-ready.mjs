import { build } from "astro";

import { productionSiteOrigin } from "../src/lib/site-origin.ts";

const site = productionSiteOrigin(process.env.SITE_ORIGIN);

await build({ site, mode: "launch-readiness" });
