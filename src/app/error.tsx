"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="card"><h1>Something went wrong</h1><p>Please try again. Your account details have not been displayed.</p><button onClick={reset}>Try again</button></section>;
}
