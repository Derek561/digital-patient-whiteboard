"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createPatientCard(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const userEmail = user.email || null;
  const displayName =
    user.user_metadata?.full_name || user.email || "Unknown User";

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: userEmail,
      full_name: displayName,
      role: "admin",
      is_active: true,
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    redirect(
      `/patients/new?message=${encodeURIComponent(
        `Profile setup failed: ${profileError.message}`,
      )}`,
    );
  }

  const patientDisplayName = String(
    formData.get("patient_display_name") || "",
  ).trim();

  if (!patientDisplayName) {
    redirect("/patients/new?message=Patient display name is required");
  }

  const payload = {
    patient_display_name: patientDisplayName,
    stage: String(formData.get("stage") || "Prospective Lead"),
    level_of_care: String(formData.get("level_of_care") || "").trim() || null,
    referral_source:
      String(formData.get("referral_source") || "").trim() || null,
    expected_date: String(formData.get("expected_date") || "") || null,
    expected_time: String(formData.get("expected_time") || "") || null,
    location_need: String(formData.get("location_need") || "").trim() || null,
    transportation_status:
      String(formData.get("transportation_status") || "pending"),
    insurance_payment_status:
      String(formData.get("insurance_payment_status") || "unknown"),
    clinical_clearance_status:
      String(formData.get("clinical_clearance_status") || "not_started"),
    blocker: String(formData.get("blocker") || "").trim() || null,
    next_action: String(formData.get("next_action") || "").trim() || null,
    next_action_due_at:
      String(formData.get("next_action_due_at") || "") || null,
    priority: String(formData.get("priority") || "medium"),
    operational_notes:
      String(formData.get("operational_notes") || "").trim() || null,
    created_by: user.id,
  };

  const { error } = await supabase.from("patient_cards").insert(payload);

  if (error) {
    redirect(`/patients/new?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}
