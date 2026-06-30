"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Email and password are required.",
      )}`,
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}