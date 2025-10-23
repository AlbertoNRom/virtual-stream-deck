import { defineConfig } from "drizzle-kit";
import { env } from "./env";

export default defineConfig({
  schema: "./utils/supabase/schema.ts",
  out: "./utils/supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.NEXT_PUBLIC_SUPABASE_DB_URL,
  },
  verbose: true,
  strict: true,
});

