import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const isProd = process.env.NODE_ENV === 'production';

export const env = createEnv({
	server: {},
	client: {
		NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
		NEXT_PUBLIC_SUPABASE_DB_URL: z.string().min(1),
		NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_SUPABASE_DB_URL: process.env.NEXT_PUBLIC_SUPABASE_DB_URL,
		NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY:
			process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
	},
});
