import { remember } from '@epic-web/remember';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env, isProd } from '../../env';

import * as schema from './schema';

const createPool = () =>
	new Pool({
		connectionString: env.NEXT_PUBLIC_SUPABASE_DB_URL,
	});

let client: Pool;

if (isProd) {
	client = createPool();
} else {
	client = remember('pool', createPool);
}

export const db = drizzle(client, { schema });

export default db;
