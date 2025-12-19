"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  console.log("login data:", data);

  try {
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("Supabase signIn error:", error);
      redirect("/error");
    }

    console.log("Supabase signIn response:", signInData);
    revalidatePath("/", "layout");
    redirect("/");
  } catch (err) {
    // If this is Next's internal redirect control flow, rethrow it so
    // the framework can handle the redirect instead of us catching it.
    if (
      err &&
      (err.message === "NEXT_REDIRECT" ||
        (err.digest && typeof err.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")))
    ) {
      throw err;
    }

    console.error("Unexpected error during signIn:", err);
    redirect("/error");
  }
}

export async function signup(formData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  console.log("signup data:", data);

  try {
    const { data: signData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("Supabase signUp error:", error);
      redirect("/error");
    }

    // Successful signup (may require email confirmation depending on Supabase settings)
    console.log("Supabase signUp response:", signData);
    revalidatePath("/", "layout");
    redirect("/");
  } catch (err) {
    // Rethrow Next redirect exceptions so Next handles navigation control.
    if (
      err &&
      (err.message === "NEXT_REDIRECT" ||
        (err.digest && typeof err.digest === "string" && err.digest.startsWith("NEXT_REDIRECT")))
    ) {
      throw err;
    }

    // Catch any other unexpected exceptions from the client library
    console.error("Unexpected error during signUp:", err);
    redirect("/error");
  }
}
