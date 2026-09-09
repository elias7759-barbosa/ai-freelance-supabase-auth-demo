"use client";
import { useActionState } from "react";
import { confirmSignup, logIn, signUp, type FormState } from "@/app/actions";

function ConfirmForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(confirmSignup, {} as FormState);
  return <form action={action} className="form">
    <p role="status">Account created. Confirm it with the code from the private test mailbox.</p>
    <input type="hidden" name="email" value={email} />
    <label htmlFor="token">Confirmation code</label>
    <input id="token" name="token" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={10} />
    {state.error && <p role="alert" className="error">{state.error}</p>}
    <button disabled={pending}>{pending ? "Confirming…" : "Confirm account"}</button>
  </form>;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [state, action, pending] = useActionState(signup ? signUp : logIn, {} as FormState);
  if (signup && state.email) return <ConfirmForm email={state.email} />;
  return <form action={action} className="form">
    <label htmlFor="email">Email</label>
    <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required aria-describedby={signup ? "sandbox-help" : undefined} />
    {signup && <p id="sandbox-help" className="hint">Use a fictional demo-yourname@example.test address. Confirmation codes are available only to the test operator.</p>}
    <label htmlFor="password">Password</label>
    <input id="password" name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 12 : undefined} maxLength={128} required />
    {signup && <>
      <p className="hint">At least 12 characters.</p>
      <label htmlFor="confirmPassword">Confirm password</label>
      <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
    </>}
    {state.error && <p role="alert" className="error">{state.error}</p>}
    <button disabled={pending}>{pending ? "Please wait…" : signup ? "Create account" : "Log in"}</button>
  </form>;
}
