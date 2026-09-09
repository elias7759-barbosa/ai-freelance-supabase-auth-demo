"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateCredentials } from "@/lib/credentials";

export type FormState = { error?: string; email?: string };
const unavailable = "Authentication is temporarily unavailable. Try again.";

export async function signUp(_previous: FormState, form: FormData): Promise<FormState> {
  const error = validateCredentials(form, true);
  if (error) return { error };
  const email = String(form.get("email")).trim().toLowerCase();
  try {
    const supabase = await createClient(true);
    const { error } = await supabase.auth.signUp({ email, password: String(form.get("password")) });
    if (error) console.warn("Signup rejected", { code: error.code, status: error.status });
    if (error) return { error: error.code === "over_email_send_rate_limit" || error.status === 429
      ? "Too many attempts. Wait before trying again." : "Could not create the account. Check your details and try again." };
    return { email };
  } catch { return { error: unavailable }; }
}

export async function confirmSignup(_previous: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const token = String(form.get("token") ?? "").trim();
  if (!/^demo-[a-z0-9-]+@example\.test$/.test(email) || !/^\d{6,10}$/.test(token))
    return { error: "Enter a valid confirmation code." };
  try {
    const supabase = await createClient(true);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
    if (error) return { error: "The confirmation code is invalid or expired." };
    // The exercise demonstrates an explicit password login after signup.
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) return { error: unavailable };
  } catch { return { error: unavailable }; }
  revalidatePath("/", "layout");
  redirect("/login?confirmed=1");
}

export async function logIn(_previous: FormState, form: FormData): Promise<FormState> {
  const error = validateCredentials(form);
  if (error) return { error };
  try {
    const supabase = await createClient(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim().toLowerCase(), password: String(form.get("password")),
    });
    if (error) return { error: error.code === "email_not_confirmed"
      ? "Confirm your email before logging in." : "Invalid email or password." };
  } catch { return { error: unavailable }; }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logOut(): Promise<FormState> {
  try {
    const supabase = await createClient(true);
    const { error } = await supabase.auth.signOut();
    if (error) return { error: "Could not log out. Please try again." };
  } catch { return { error: unavailable }; }
  revalidatePath("/", "layout");
  redirect("/login");
}
