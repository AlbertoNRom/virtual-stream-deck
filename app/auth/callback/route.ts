// The client you created from the Server-Side Auth instructions

import { createClient } from '@/db/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get('code');
	// if "next" is in param, use it as the redirect URL
	const next = searchParams.get('next') ?? '/dashboard';

	const host = request.headers.get('host') || '';
	const protocol = host.includes('localhost') ? 'http' : 'https';
	const baseUrl = `${protocol}://${host}`;

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			return NextResponse.redirect(`${baseUrl}${next}`);
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
}
