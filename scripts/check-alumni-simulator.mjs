// Simulator-only preflight. Run: node --env-file=.env.simulator.local scripts/check-alumni-simulator.mjs
// No elevated keys, no writes, no production access.
const expected = "gnawvoxpluyyaqvbpzwd";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing simulator URL or publishable key in .env.simulator.local.");
  process.exit(1);
}
const host = new URL(url).hostname;
if (host !== expected + ".supabase.co") {
  console.error("STOP: refusing to test a non-simulator Supabase project:", host);
  process.exit(1);
}
const tables = ["alumni_people", "alumni_messages", "alumni_followups", "alumni_staff_roles"];
let failed = false;
for (const table of tables) {
  try {
    const response = await fetch(url + "/rest/v1/" + table + "?select=*&limit=0", {
      headers: { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      console.log("FAIL", table, response.status, detail);
      failed = true;
    } else {
      console.log("PASS", table, "REST endpoint accessible (zero rows requested)");
    }
  } catch (error) {
    console.log("FAIL", table, String(error));
    failed = true;
  }
}
if (failed) {
  console.error("Simulator API preflight incomplete. Do not treat this environment as ready.");
  process.exit(1);
}
console.log("Simulator API preflight passed. This does not verify staff sign-in or authorized RLS access.");
