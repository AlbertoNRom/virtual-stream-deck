# 🎵 Virtual Stream Deck

<div align="center">
  <img src="public/icon-512x512.svg" alt="Virtual Stream Deck Logo" width="128" height="128">
  
  **Professional Sound Board & Audio Control for Streamers**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## ✨ Features

- 🎛️ **Customizable Grid Layout** - Drag and drop interface with resizable sound board
- 🎵 **Audio Management** - Upload, organize, and play sound effects with real-time controls
- ⌨️ **Hotkey Support** - Assign keyboard shortcuts to any sound for quick access
- 🎨 **Visual Customization** - Personalize keys with custom colors, labels, and icons
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🔐 **User Authentication** - Secure login with Supabase Auth
- ☁️ **Cloud Storage** - Store and sync your sounds across devices
- 🚀 **PWA Ready** - Install as a native app on any device

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Google Cloud Platform account (for storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/virtual-stream-deck.git
   cd virtual-stream-deck
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Google Cloud Storage (Optional)
   GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
   GOOGLE_CLOUD_STORAGE_BUCKET=your_storage_bucket
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Supabase Setup

### 1. Create a New Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be ready

### 2. Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Create sounds table
create table sounds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  file_url text not null,
  file_size bigint,
  duration real,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stream_deck_configs table
create table stream_deck_configs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  grid_size jsonb not null default '{"rows": 3, "cols": 3}',
  keys jsonb not null default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table sounds enable row level security;
alter table stream_deck_configs enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

create policy "Users can view own sounds." on sounds
  for select using (auth.uid() = user_id);

create policy "Users can insert own sounds." on sounds
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sounds." on sounds
  for update using (auth.uid() = user_id);

create policy "Users can delete own sounds." on sounds
  for delete using (auth.uid() = user_id);

create policy "Users can view own configs." on stream_deck_configs
  for select using (auth.uid() = user_id);

create policy "Users can insert own configs." on stream_deck_configs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own configs." on stream_deck_configs
  for update using (auth.uid() = user_id);
```

### 3. Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `sounds`
3. Set the bucket to public
4. Add the following policy:

```sql
-- Allow users to upload sounds
create policy "Users can upload sounds" on storage.objects
  for insert with check (bucket_id = 'sounds' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their sounds
create policy "Users can view own sounds" on storage.objects
  for select using (bucket_id = 'sounds' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their sounds
create policy "Users can delete own sounds" on storage.objects
  for delete using (bucket_id = 'sounds' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Authentication Setup

1. Go to Authentication > Settings
2. Configure your site URL: `http://localhost:3000` (development) or your production URL
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

## ☁️ Google Cloud Platform Setup (Optional)

### 1. Create a GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Cloud Storage API

### 2. Create a Storage Bucket

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Create a storage bucket
gsutil mb gs://your-virtual-stream-deck-bucket

# Set bucket permissions (optional)
gsutil iam ch allUsers:objectViewer gs://your-virtual-stream-deck-bucket
```

### 3. Service Account Setup

1. Go to IAM & Admin > Service Accounts
2. Create a new service account
3. Grant "Storage Object Admin" role
4. Create and download a JSON key
5. Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
   ```

## 🛠️ Development

### Project Structure

```
virtual-stream-deck/
├── app/                    # Next.js 13+ app directory
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Main dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── sitemap.ts        # SEO sitemap
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth-button.tsx   # Authentication component
│   ├── key-config.tsx    # Key configuration
│   ├── sound-library.tsx # Sound management
│   └── stream-deck-grid.tsx # Main grid component
├── lib/                  # Utilities and hooks
│   ├── hooks/           # Custom React hooks
│   ├── store.ts         # Zustand state management
│   ├── types.ts         # TypeScript definitions
│   └── utils.ts         # Utility functions
├── public/              # Static assets
└── utils/               # Server utilities
    └── supabase/        # Supabase configuration
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Key Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Audio**: Web Audio API
- **Drag & Drop**: @dnd-kit
- **File Upload**: react-dropzone

## 🎯 Usage

### Getting Started

1. **Sign Up/Login**: Create an account or sign in
2. **Upload Sounds**: Drag and drop audio files or click to upload
3. **Configure Grid**: Customize your stream deck layout
4. **Assign Sounds**: Drag sounds to grid positions
5. **Set Hotkeys**: Assign keyboard shortcuts to sounds
6. **Customize**: Change colors, labels, and icons

### Supported Audio Formats

- MP3
- WAV
- OGG
- M4A
- FLAC

### Keyboard Shortcuts

- `Space`: Stop all playing sounds
- `1-9`: Trigger sounds in grid positions
- `Ctrl/Cmd + U`: Upload new sound
- `Ctrl/Cmd + S`: Save configuration

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Google Cloud Run

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icon library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting and deployment

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@virtualstreamdeck.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/virtual-stream-deck/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/virtual-stream-deck/discussions)

---

<div align="center">
  Made with ❤️ for the streaming community
</div>