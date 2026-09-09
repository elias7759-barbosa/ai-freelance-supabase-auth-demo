import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export default function Signup() {
  return <section className="card narrow">
    <p className="eyebrow">START HERE</p><h1>Create an account</h1>
    <p>A sandbox for demonstrating real authentication. Fictional data only.</p>
    <AuthForm mode="signup" />
    <p className="footnote">Already registered? <Link href="/login">Log in</Link></p>
  </section>;
}
