import { defineConfig } from 'drizzle-kit';
import { env } from './env';

export default defineConfig({
	schema: './db/supabase/schema.ts',
	out: './db/supabase/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: env.NEXT_PUBLIC_SUPABASE_DB_URL,
	},
	verbose: true,
	strict: true,
});
