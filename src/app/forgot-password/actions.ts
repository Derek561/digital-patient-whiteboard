"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect(
      `/forgot-password?message=${encodeURIComponent(
        "Email address is required.",
      )}`,
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?message=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/forgot-password?message=${encodeURIComponent(
      "If this email is approved, a password reset link has been sent.",
    )}`,
  );
}
