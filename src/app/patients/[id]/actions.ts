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

  const { data: existingCard, error: existingError } = await supabase
    .from("patient_cards")
    .select(
      "stage, blocker, next_action, assigned_owner, current_location_setting, current_detox, detox_needed, expected_from_detox, expected_to_admit_after_detox",
    )
    .eq("id", patientCardId)
    .single();

  if (existingError || !existingCard) {
    redirect(
      `/patients/${patientCardId}?message=${encodeURIComponent(
        existingError?.message || "Unable to load existing card",
      )}`,
    );
  }

  const stage = String(formData.get("stage") || "New Inquiry / Lead");
  const blocker = String(formData.get("blocker") || "").trim() || null;
  const nextAction = String(formData.get("next_action") || "").trim() || null;
  const assignedOwner =
    String(formData.get("assigned_owner") || "").trim() || null;
  const quickUpdateNote =
    String(formData.get("quick_update_note") || "").trim() || null;
  const currentLocationSetting =
    String(formData.get("current_location_setting") || "").trim() || null;
  const currentDetox =
    String(formData.get("current_detox") || "").trim() || null;
  const detoxNeeded = String(formData.get("detox_needed") || "unknown");
  const expectedFromDetox = String(
    formData.get("expected_from_detox") || "unknown",
  );
  const expectedToAdmitAfterDetox = String(
    formData.get("expected_to_admit_after_detox") || "unknown",
  );

  const payload = {
    stage,
    current_location_setting: currentLocationSetting,
    detox_needed: detoxNeeded,
    detox_referred_to:
      String(formData.get("detox_referred_to") || "").trim() || null,
    current_detox: currentDetox,
    expected_from_detox: expectedFromDetox,
    expected_to_admit_after_detox: expectedToAdmitAfterDetox,
    conversion_status: String(formData.get("conversion_status") || "open"),
    blocker,
    next_action: nextAction,
    assigned_owner: assignedOwner,
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

  const changes = [];

  if (existingCard.stage !== stage) {
    changes.push(`Stage: ${existingCard.stage} → ${stage}`);
  }

  if (existingCard.current_location_setting !== currentLocationSetting) {
    changes.push(
      `Location: ${existingCard.current_location_setting || "not set"} → ${
        currentLocationSetting || "not set"
      }`,
    );
  }

  if (existingCard.current_detox !== currentDetox) {
    changes.push(
      `Current detox: ${existingCard.current_detox || "not set"} → ${
        currentDetox || "not set"
      }`,
    );
  }

  if (existingCard.detox_needed !== detoxNeeded) {
    changes.push(`Detox needed: ${existingCard.detox_needed} → ${detoxNeeded}`);
  }

  if (existingCard.expected_from_detox !== expectedFromDetox) {
    changes.push(
      `Expected from detox: ${existingCard.expected_from_detox} → ${expectedFromDetox}`,
    );
  }

  if (
    existingCard.expected_to_admit_after_detox !== expectedToAdmitAfterDetox
  ) {
    changes.push(
      `Expected to admit after detox: ${existingCard.expected_to_admit_after_detox} → ${expectedToAdmitAfterDetox}`,
    );
  }

  if (existingCard.blocker !== blocker) {
    changes.push(
      `Blocker: ${existingCard.blocker || "none"} → ${blocker || "none"}`,
    );
  }

  if (existingCard.next_action !== nextAction) {
    changes.push(
      `Next action: ${existingCard.next_action || "none"} → ${
        nextAction || "none"
      }`,
    );
  }

  if (existingCard.assigned_owner !== assignedOwner) {
    changes.push(
      `Owner: ${existingCard.assigned_owner || "none"} → ${
        assignedOwner || "none"
      }`,
    );
  }

  const updateNote =
    changes.length > 0
      ? `${changes.join(" | ")}${quickUpdateNote ? ` | Note: ${quickUpdateNote}` : ""}`
      : quickUpdateNote ||
        "Movement card reviewed with no tracked field changes";

  const { error: activityLogError } = await supabase
    .from("patient_activity_logs")
    .insert({
      patient_card_id: patientCardId,
      stage_at_time: stage,
      update_type: "updated",
      update_note: updateNote,
      created_by: user.id,
    });

  if (activityLogError) {
    redirect(
      `/patients/${patientCardId}?message=${encodeURIComponent(
        `Activity log failed: ${activityLogError.message}`,
      )}`,
    );
  }

  redirect("/");
}

export async function archivePatientCard(
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

  const closeReason = String(formData.get("close_reason") || "").trim();
  const closeNote = String(formData.get("close_note") || "").trim();

  if (!closeReason) {
    redirect(
      `/patients/${patientCardId}?message=${encodeURIComponent(
        "Close reason is required.",
      )}`,
    );
  }

  const conversionStatus =
    closeReason === "admitted_to_program" ? "admitted" : "closed";

  const { data: existingCard, error: existingError } = await supabase
    .from("patient_cards")
    .select("stage")
    .eq("id", patientCardId)
    .single();

  if (existingError || !existingCard) {
    redirect(
      `/patients/${patientCardId}?message=${encodeURIComponent(
        existingError?.message || "Unable to load card before closing.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("patient_cards")
    .update({
      is_archived: true,
      conversion_status: conversionStatus,
      stage:
        closeReason === "admitted_to_program"
          ? "Admitted"
          : "Closed / No Further Action",
      operational_notes: closeNote || null,
    })
    .eq("id", patientCardId);

  if (error) {
    redirect(
      `/patients/${patientCardId}?message=${encodeURIComponent(error.message)}`,
    );
  }

  await supabase.from("patient_activity_logs").insert({
    patient_card_id: patientCardId,
    stage_at_time:
      closeReason === "admitted_to_program"
        ? "Admitted"
        : "Closed / No Further Action",
    update_type: "updated",
    update_note: `Card closed / archived. Reason: ${closeReason}${
      closeNote ? ` | Note: ${closeNote}` : ""
    }`,
    next_action: null,
    next_action_due_at: null,
    confidentiality_check: "Minimum necessary only",
    created_by: user.id,
  });

  redirect("/");
}
