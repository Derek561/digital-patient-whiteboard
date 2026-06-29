"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updatePatientCard(
  patientCardId: string,
  formData: FormData,
) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const payload = {
    stage: String(formData.get("stage") || "New Inquiry / Lead"),
    current_location_setting:
      String(formData.get("current_location_setting") || "").trim() || null,
    detox_needed: String(formData.get("detox_needed") || "unknown"),
    detox_referred_to:
      String(formData.get("detox_referred_to") || "").trim() || null,
    current_detox: String(formData.get("current_detox") || "").trim() || null,
    expected_from_detox:
      String(formData.get("expected_from_detox") || "unknown"),
    expected_to_admit_after_detox:
      String(formData.get("expected_to_admit_after_detox") || "unknown"),
    conversion_status: String(formData.get("conversion_status") || "open"),
    blocker: String(formData.get("blocker") || "").trim() || null,
    next_action: String(formData.get("next_action") || "").trim() || null,
    next_follow_up_due_at:
      String(formData.get("next_follow_up_due_at") || "") || null,
    next_action_due_at:
      String(formData.get("next_action_due_at") || "") || null,
    operational_notes:
      String(formData.get("operational_notes") || "").trim() || null,
  };

  const { error } = await supabase
    .from("patient_cards")
    .update(payload)
    .eq("id", patientCardId);

  if (error) {
    redirect(
      `/patients/${patientCardId}?message=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/");
}
