import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return <section className="card">
    <p className="eyebrow">PROTECTED AREA</p><h1>Dashboard</h1>
    <span className="badge">Authenticated session</span>
    <dl className="account"><dt>Signed in as</dt><dd>{user.email}</dd></dl>
    <p>Your session is checked on the server. Refresh this page to verify that you remain signed in.</p>
    <LogoutButton />
  </section>;
}
