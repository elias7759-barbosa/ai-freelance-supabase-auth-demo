import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data?.claims?.sub);
  return <section className="card hero">
    <p className="eyebrow">AI FREELANCE · DEMONSTRATION PROJECT</p>
    <h1>Supabase Auth Demo</h1>
    <p className="lead">A small app. A verifiable authentication flow.</p>
    <p>Sign up, log in, refresh your session and log out. Built as the starting point for a controlled troubleshooting exercise.</p>
    <span className={authenticated ? "badge" : "badge neutral"}>{authenticated ? "Signed in" : "Visitor session"}</span>
    <div className="actions">
      <Link className="button" href={authenticated ? "/dashboard" : "/login"}>{authenticated ? "Open dashboard" : "Log in"}</Link>
      <Link className="button secondary" href="/signup">Sign up</Link>
    </div>
    <p className="footnote">Sample portfolio project · Fictional accounts only · No client data</p>
  </section>;
}
