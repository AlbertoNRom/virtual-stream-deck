import './globals.css';
import { Toaster } from '@/shared/ui/components/shadcn/sonner';
import { ThemeProvider } from '@/shared/ui/components/theme-provider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: {
		default: 'Virtual Stream Deck - Professional Sound Board & Audio Control',
		template: '%s | Virtual Stream Deck',
	},
	description:
		'Professional virtual stream deck with customizable sound board, hotkey support, and real-time audio control. Perfect for streamers, content creators, and audio professionals.',
	keywords: [
		'virtual stream deck',
		'sound board',
		'audio control',
		'streaming tools',
		'content creation',
		'hotkeys',
		'sound effects',
		'audio management',
		'streaming software',
		'broadcast tools',
		'React',
		'Next.js',
		'TypeScript',
		'Tailwind CSS',
	],
	authors: [{ name: 'Virtual Stream Deck Team' }],
	creator: 'Virtual Stream Deck',
	publisher: 'Virtual Stream Deck',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL('https://virtualstreamdeck.com'),
	alternates: {
		canonical: '/',
	},
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
	},
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		title: 'Virtual Stream Deck - Professional Sound Board & Audio Control',
		description:
			'Professional virtual stream deck with customizable sound board, hotkey support, and real-time audio control. Perfect for streamers and content creators.',
		url: 'https://virtualstreamdeck.com',
		siteName: 'Virtual Stream Deck',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'Virtual Stream Deck - Professional Sound Board Interface',
			},
		],
		locale: 'en_US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Virtual Stream Deck - Professional Sound Board & Audio Control',
		description:
			'Professional virtual stream deck with customizable sound board, hotkey support, and real-time audio control.',
		creator: '@virtualstreamdeck',
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: 'Virtual Stream Deck - Professional Sound Board Interface',
			},
		],
	},
	verification: {
		google: 'your-google-verification-code',
	},
	manifest: '/manifest.json',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Virtual Stream Deck',
	},
};

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': 'WebApplication',
	name: 'Virtual Stream Deck',
	description:
		'Professional virtual stream deck with customizable sound board, hotkey support, and real-time audio control.',
	url: 'https://virtualstreamdeck.com',
	applicationCategory: 'MultimediaApplication',
	operatingSystem: 'Web Browser',
	offers: {
		'@type': 'Offer',
		price: '0',
		priceCurrency: 'USD',
	},
	creator: {
		'@type': 'Organization',
		name: 'Virtual Stream Deck Team',
	},
	featureList: [
		'Customizable sound board',
		'Hotkey support',
		'Real-time audio control',
		'Drag and drop interface',
		'Multiple audio format support',
		'Responsive design',
	],
	screenshot: 'https://virtualstreamdeck.com/og-image.png',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script type="application/ld+json" id="structured-data">
					{JSON.stringify(jsonLd)}
				</script>
			</head>
			<body className={inter.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					{children}
					<Toaster />
				</ThemeProvider>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
