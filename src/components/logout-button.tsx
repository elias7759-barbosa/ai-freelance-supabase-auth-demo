"use client";
import { useActionState } from "react";
import { logOut, type FormState } from "@/app/actions";
export function LogoutButton() {
  const [state, action, pending] = useActionState(logOut, {} as FormState);
  return <form action={action}>
    <button disabled={pending}>{pending ? "Logging out…" : "Log out"}</button>
    {state.error && <p role="alert" className="error">{state.error}</p>}
  </form>;
}
