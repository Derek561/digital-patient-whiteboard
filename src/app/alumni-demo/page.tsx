import { redirect } from "next/navigation";
import AlumniStaffDemo from "@/components/AlumniStaffDemo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Deliberately separate from patient_cards and other legacy Whiteboard tables.
// This route is a fictional, session-local interface for staff workflow review.
// It performs NO writes to Supabase and sends NO messages or calls.
export default async function AlumniDemoPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=%2Falumni-demo");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    redirect("/login?next=%2Falumni-demo&message=Your%20staff%20account%20is%20not%20active.");
  }

  return (
    <AlumniStaffDemo
      staffEmail={user.email ?? "Signed-in staff"}
      legacyRole={profile.role ?? "staff"}
    />
  );
}
