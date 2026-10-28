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
    if (response.ok) {
      console.log("PASS", table, "REST endpoint reachable (zero rows requested)");
    } else {
      const detail = await response.json().catch(() => ({}));
      if (response.status === 401 && detail.code === "42501" && String(detail.message).includes("permission denied for table")) {
        console.log("PASS", table, "API reachable; anonymous SELECT correctly restricted");
      } else {
        console.log("FAIL", table, response.status, JSON.stringify(detail).slice(0, 240));
        failed = true;
      }
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
console.log("Simulator API endpoint preflight passed. Authenticated staff access still requires a separate sign-in test.");
