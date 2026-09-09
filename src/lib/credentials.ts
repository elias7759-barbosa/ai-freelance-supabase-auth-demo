export function validateCredentials(form: FormData, signup = false): string | null {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return "Enter a valid email address.";
  if (!password) return "Enter your password.";
  if (password.length > 128) return "Use at most 128 characters.";
  if (signup && password.length < 12) return "Use at least 12 characters.";
  if (signup && password !== String(form.get("confirmPassword") ?? "")) return "Passwords do not match.";
  if (signup && !/^demo-[a-z0-9-]+@example\.test$/.test(email)) return "Use a fictional demo-…@example.test address.";
  return null;
}
