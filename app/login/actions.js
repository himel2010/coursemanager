"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
    // After signup, send user to the full signup/profile page to fill department and courses
    redirect("/signup");
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
    role: formData.get("role") || "STUDENT",
    name: formData.get("name") || null,
    studentId: formData.get("studentId") || null,
  };
  console.log("signup data:", data);

  try {
    // If signing up as faculty, enforce @bracu.ac.bd email domain
    if (data.role === "FACULTY" && !data.email.toLowerCase().endsWith("@bracu.ac.bd")) {
      console.error("Faculty signup attempted with non-bracu email:", data.email);
      redirect("/error");
    }
    const { data: signData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { role: data.role },
      },
    });

    if (error) {
      console.error("Supabase signUp error:", error);
      redirect("/error");
    }

    // Successful signup (may require email confirmation depending on Supabase settings)
    console.log("Supabase signUp response:", signData);
    // Persist role in Prisma user table (if Supabase returned a user id)
    try {
      if (signData && signData.user && signData.user.id) {
        await prisma.user.upsert({
          where: { id: signData.user.id },
          update: {
            email: data.email,
            role: data.role === "FACULTY" ? "FACULTY" : "STUDENT",
            name: data.name,
            studentId: data.studentId || null,
          },
          create: {
            id: signData.user.id,
            email: data.email,
            role: data.role === "FACULTY" ? "FACULTY" : "STUDENT",
            name: data.name,
            studentId: data.studentId || null,
          },
        });
      }
    } catch (dbErr) {
      console.error("Error upserting user role into Prisma:", dbErr);
    }
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
