import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { authConfig, cookieOptions } from "./config";

export async function createClient(writable = false) {
  const store = await cookies();
  const { url, key } = authConfig();
  return createServerClient(url, key, {
    cookieOptions,
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        // Server Components cannot write cookies; Proxy owns refresh there.
        // Actions opt into writes so cookie failures are not silently swallowed.
        if (writable) values.forEach(({ name, value, options }) => store.set(name, value, options));
      },
    },
  });
}
