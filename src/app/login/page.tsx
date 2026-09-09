import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
export default async function Login({ searchParams }: { searchParams: Promise<{ confirmed?: string }> }) {
  const { confirmed } = await searchParams;
  return <section className="card narrow">
    <p className="eyebrow">WELCOME BACK</p><h1>Log in</h1><p>Access your protected dashboard.</p>
    {confirmed === "1" && <p role="status" className="success">Account confirmed. Log in with your password.</p>}
    <AuthForm mode="login" />
    <p className="footnote">New here? <Link href="/signup">Sign up</Link></p>
  </section>;
}
