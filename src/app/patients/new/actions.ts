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

  const stage = String(formData.get("stage") || "New Inquiry / Lead");
  const nextAction = String(formData.get("next_action") || "").trim() || null;
  const blocker = String(formData.get("blocker") || "").trim() || null;

  const payload = {
    patient_display_name: patientDisplayName,

    lead_source: String(formData.get("lead_source") || "").trim() || null,
    referral_source_name:
      String(formData.get("referral_source_name") || "").trim() || null,
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
    target_program: String(formData.get("target_program") || "").trim() || null,
    conversion_status: String(formData.get("conversion_status") || "open"),
    next_follow_up_due_at:
      String(formData.get("next_follow_up_due_at") || "") || null,

    stage,
    level_of_care: String(formData.get("target_program") || "").trim() || null,
    referral_source:
      String(formData.get("referral_source_name") || "").trim() || null,
    expected_date: String(formData.get("expected_date") || "") || null,
    expected_time: String(formData.get("expected_time") || "") || null,
    location_need:
      String(formData.get("current_location_setting") || "").trim() || null,
    transportation_status:
      String(formData.get("transportation_status") || "pending"),
    insurance_payment_status:
      String(formData.get("insurance_payment_status") || "unknown"),
    clinical_clearance_status:
      String(formData.get("clinical_clearance_status") || "not_started"),
    blocker,
    next_action: nextAction,
    next_action_due_at:
      String(formData.get("next_action_due_at") || "") || null,
    priority: String(formData.get("priority") || "medium"),
    operational_notes:
      String(formData.get("operational_notes") || "").trim() || null,
    created_by: user.id,
  };

  const { data: createdCard, error } = await supabase
    .from("patient_cards")
    .insert(payload)
    .select("id")
    .single();

  if (error || !createdCard) {
    redirect(
      `/patients/new?message=${encodeURIComponent(
        error?.message || "Patient card creation failed",
      )}`,
    );
  }

  await supabase.from("patient_activity_logs").insert({
    patient_card_id: createdCard.id,
    activity_type: "created",
    summary: `Card created in ${stage}`,
    detail: [
      nextAction ? `Next action: ${nextAction}` : null,
      blocker ? `Blocker: ${blocker}` : null,
    ]
      .filter(Boolean)
      .join(" | "),
    created_by: user.id,
  });

  redirect("/");
}
