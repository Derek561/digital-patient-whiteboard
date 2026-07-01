"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function cleanText(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text.length > 0 ? text : null;
}

function cleanDateTime(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text.length > 0 ? text : null;
}

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

  const patientDisplayName = cleanText(formData.get("patient_display_name"));

  if (!patientDisplayName) {
    redirect("/patients/new?message=Name or display name is required");
  }

  const captureType =
    String(formData.get("capture_type") || "").trim() || "potential_client";

  const mappedStage =
    captureType === "referral_source_admission"
      ? "Scheduled Admission"
      : captureType === "relapse_detox"
        ? "Currently in Detox"
        : "New Inquiry / Lead";

  const sourceOrFacility = cleanText(formData.get("source_or_facility"));
  const otherSourceName = cleanText(formData.get("other_source_name"));
  const finalSourceName =
    sourceOrFacility === "Other"
      ? otherSourceName || "Other"
      : sourceOrFacility;
  const currentLocationSetting =
    String(formData.get("current_location_setting") || "").trim() || "unknown";

  const assignedOwner = cleanText(formData.get("assigned_owner"));
  const nextAction = cleanText(formData.get("next_action"));
  const blocker = cleanText(formData.get("blocker"));
  const quickNote = cleanText(formData.get("quick_note"));

  const nextFollowUpDueAt = cleanDateTime(
    formData.get("next_follow_up_due_at"),
  );
  const expectedDate = cleanDateTime(formData.get("expected_date"));
  const expectedTime = cleanText(formData.get("expected_time"));
  const tentativeDetoxDcDate = cleanDateTime(
    formData.get("tentative_detox_dc_date"),
  );

  const detoxName =
    captureType === "relapse_detox"
      ? sourceOrFacility
      : cleanText(formData.get("current_detox"));

  const referralSourceName =
    captureType === "referral_source_admission" ? finalSourceName : null;

  const detoxNeeded =
    captureType === "relapse_detox"
      ? "yes"
      : String(formData.get("detox_needed") || "unknown");

  const expectedFromDetox =
    captureType === "relapse_detox"
      ? "yes"
      : String(formData.get("expected_from_detox") || "unknown");

  const expectedToAdmitAfterDetox =
    captureType === "relapse_detox"
      ? "maybe"
      : String(formData.get("expected_to_admit_after_detox") || "unknown");

  const conversionStatus =
    captureType === "referral_source_admission" ? "likely" : "open";

  const targetProgram = cleanText(formData.get("target_program"));

  const payload = {
    patient_display_name: patientDisplayName,
    capture_type: captureType,

    lead_source:
      captureType === "potential_client"
        ? String(formData.get("lead_source") || "outreach")
        : captureType === "referral_source_admission"
          ? "provider"
          : "detox",

    referral_source_name: referralSourceName,
    referral_source: referralSourceName,
    current_location_setting: currentLocationSetting,
    location_need: currentLocationSetting,

    detox_needed: detoxNeeded,
    detox_referred_to:
      captureType === "relapse_detox"
        ? detoxName
        : cleanText(formData.get("detox_referred_to")),
    current_detox: detoxName,
    expected_from_detox: expectedFromDetox,
    expected_to_admit_after_detox: expectedToAdmitAfterDetox,

    target_program: targetProgram,
    level_of_care: targetProgram,

    conversion_status: conversionStatus,
    stage: mappedStage,

    expected_date:
      captureType === "relapse_detox" ? tentativeDetoxDcDate : expectedDate,
    expected_time: expectedTime,

    transportation_status: String(
      formData.get("transportation_status") || "pending",
    ),
    insurance_payment_status: String(
      formData.get("insurance_payment_status") || "unknown",
    ),
    clinical_clearance_status: String(
      formData.get("clinical_clearance_status") || "not_started",
    ),

    blocker,
    assigned_owner: assignedOwner,
    next_action: nextAction,
    next_follow_up_due_at: nextFollowUpDueAt,
    next_action_due_at: nextFollowUpDueAt,

    priority: String(formData.get("priority") || "medium"),
    operational_notes: quickNote,

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
        error?.message || "Movement card creation failed",
      )}`,
    );
  }

  const captureLabel =
    captureType === "referral_source_admission"
      ? "Referral Source Admission"
      : captureType === "relapse_detox"
        ? "Relapse / Detox"
        : "Potential Client";

  const updateNote = [
    `Card created as ${captureLabel}`,
    `Stage: ${mappedStage}`,
    sourceOrFacility ? `Source / facility: ${sourceOrFacility}` : null,
    currentLocationSetting ? `Location: ${currentLocationSetting}` : null,
    assignedOwner ? `Owner: ${assignedOwner}` : null,
    nextAction ? `Next action: ${nextAction}` : null,
    quickNote ? `Note: ${quickNote}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const { error: activityLogError } = await supabase
    .from("patient_activity_logs")
    .insert({
      patient_card_id: createdCard.id,
      stage_at_time: mappedStage,
      update_type: "created",
      update_note: updateNote,
      next_action: nextAction,
      operational_notes: quickNote,
      next_action_due_at: nextFollowUpDueAt,
      confidentiality_check: "Minimum necessary only",
      created_by: user.id,
    });

  if (activityLogError) {
    redirect(
      `/patients/new?message=${encodeURIComponent(
        `Card created, but activity log failed: ${activityLogError.message}`,
      )}`,
    );
  }

  redirect("/");
}