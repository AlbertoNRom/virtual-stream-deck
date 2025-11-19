import { createClient } from '@/db/supabase/server';
import { SoundLibrary } from '@/features/sounds/ui/components/SoundLibrary';
import { KeyConfig } from '@/features/streamdeck/ui/components/KeyConfig';
import { StreamDeckGrid } from '@/features/streamdeck/ui/components/StreamDeckGrid';
import { Button } from '@/shared/ui/components/shadcn/button';
import { LogOut } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Dashboard - Virtual Stream Deck',
	description:
		'Manage your sound library and configure your stream deck with custom audio clips for professional streaming.',
	keywords: [
		'dashboard',
		'sound board',
		'stream deck',
		'audio clips',
		'streaming',
		'content creation',
	],
	openGraph: {
		title: 'Dashboard - Virtual Stream Deck',
		description:
			'Manage your sound library and configure your stream deck with custom audio clips for professional streaming.',
		type: 'website',
	},
};

export default async function Dashboard() {
	const supabase = createClient();
	const {
		data: { user },
	} = await (await supabase).auth.getUser();

	if (!user) {
		redirect('/');
	}

	const signOut = async () => {
		'use server';
		const supabase = createClient();
		await (await supabase).auth.signOut();
		redirect('/');
	};

	const soundsPromise = (async () => {
		const sb = await supabase;
		const { data, error } = await sb
			.from('sounds')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false });
		if (error) throw error;
		return data ?? [];
	})();

	const keysPromise = (async () => {
		const sb = await supabase;
		const { data, error } = await sb
			.from('stream_deck_keys')
			.select('*')
			.eq('user_id', user.id)
			.order('position', { ascending: true });
		if (error) throw error;
		return data ?? [];
	})();

	// Note: The selectedKey is managed through global state in useSoundStore

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-4 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
							Dashboard
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground">
							Welcome, <b>{user?.user_metadata?.full_name ?? user?.email}</b>
						</p>
					</div>
					<form action={signOut}>
						<Button variant="ghost" className="gap-2 text-sm sm:text-base">
							<LogOut className="h-4 w-4" />
							<span className="hidden sm:inline">Logout</span>
						</Button>
					</form>
				</div>

				{/* Responsive layout: mobile (1 column), tablet (2 columns), desktop (3 columns) */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
					{/* Sound Library */}
					<div className="lg:col-span-3 order-1 lg:order-1">
						<Suspense
							fallback={
								<div className="glassmorphism rounded-lg p-4 sm:p-6 animate-pulse space-y-4">
									<div className="h-6 w-32 bg-muted rounded" />
									<div className="h-4 w-48 bg-muted rounded" />
									<div className="mt-4 space-y-2">
										{Array.from({ length: 6 }).map((_, i) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: not a problem for this use case
											<div key={i} className="p-3 rounded-lg bg-muted/40">
												<div className="h-4 w-full bg-muted rounded" />
											</div>
										))}
									</div>
								</div>
							}
						>
							<SoundLibrary initialSoundsPromise={soundsPromise} />
						</Suspense>
					</div>

					{/* Stream Deck Grid */}
					<div className="lg:col-span-6 order-3 lg:order-2">
						<div className="glassmorphism rounded-lg p-4 sm:p-6">
							<Suspense
								fallback={
									<div
										className="grid gap-2 sm:gap-4 md:gap-6 lg:gap-8 p-2 sm:p-4 md:p-6 lg:p-8"
										style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
									>
										{Array.from({ length: 9 }).map((_, i) => (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: not a problem for this use case
												key={i}
												className="aspect-square rounded-md bg-muted/40 animate-pulse"
											/>
										))}
									</div>
								}
							>
								<StreamDeckGrid
									config={{ rows: 3, columns: 3 }}
									initialKeysPromise={keysPromise}
								/>
							</Suspense>
						</div>
					</div>

					{/* Key Configuration */}
					<div className="lg:col-span-3 order-2 lg:order-3">
						<KeyConfig />
					</div>
				</div>
			</div>
		</div>
	);
}
