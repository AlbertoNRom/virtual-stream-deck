# 🎵 Virtual Stream Deck

<div align="center">
  <img src="public/icon-512x512.svg" alt="Virtual Stream Deck Logo" width="128" height="128">
  
  **Professional Sound Board & Audio Control for Streamers**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Google Cloud Platform account (for auth)

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
NEXT_PUBLIC_SUPABASE_DB_URL=postgres_connection_string
   
# Sentry (Optional)
SENTRY_AUTH_TOKEN=your_sentry_auth_token
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

Este proyecto define el esquema con DrizzleORM en `utils/supabase/schema.ts` y aplica migraciones con `drizzle-kit`.

Pasos para preparar la base de datos (Supabase/Postgres):

1. Configura la cadena de conexión en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_DB_URL=postgresql://<usuario>:<password>@<host>:<puerto>/<db>`
   - En Supabase, copia la Connection string (URI) desde la sección de Base de datos.

2. Genera las migraciones a partir del esquema:
   ```bash
   npm run drizzle:generate
   # o
   pnpm drizzle:generate
   ```

3. Aplica las migraciones en tu base de datos:
   ```bash
   npm run drizzle:push
   # o
   pnpm drizzle:push
   ```

4. (Opcional) Inspecciona el estado con Drizzle Studio:
   ```bash
   npm run drizzle:studio
   ```

Notas:
- El esquema incluye las tablas `sounds` y `stream_deck_keys` por defecto (ver `utils/supabase/schema.ts`).
- Las políticas RLS u otros ajustes avanzados pueden gestionarse mediante migraciones adicionales si las necesitas.
- No es necesario ejecutar SQL manual: Drizzle genera y aplica los cambios automáticamente.

### 3. Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `vsd-bucket`
3. Set the bucket to public
4. Add the following policy:

```sql
-- Allow users to upload sounds
create policy "Users can upload sounds" on storage.objects
  for insert with check (bucket_id = 'vsd-bucket' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their sounds
create policy "Users can view own sounds" on storage.objects
  for select using (bucket_id = 'vsd-bucket' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their sounds
create policy "Users can delete own sounds" on storage.objects
  for delete using (bucket_id = 'vsd-bucket' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Initial Sound Setup

The project includes an API endpoint to automatically set up example sounds for new users:

1. **Example Sounds**: The project includes 3 sample audio files in the `sound-examples/` folder:
   - Glass Break
   - Cinematic Hit 3
   - Police Siren

2. **API Endpoint**: Use the `/api/initial-sounds` endpoint to set up these sounds:
   ```bash
   curl -X POST http://localhost:3000/api/initial-sounds \
     -H "Content-Type: application/json" \
     -d '{"userId": "your-user-uuid"}'
   ```

3. **Features**:
   - Checks if files already exist in storage before uploading
   - Creates corresponding database entries for sounds and stream deck keys
   - Prevents duplicate uploads and configurations

### 5. Authentication Setup

1. Go to Authentication > Settings
2. Configure your site URL: `http://localhost:3000` (development) or your production URL
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

## ☁️ Google Cloud Platform Setup

### 1. Create a GCP Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Cloud Storage API

### 2. Crear un ID de cliente OAuth 2.0 (Aplicación web)

1. Entra en Google Cloud Console → "APIs & Services" → "OAuth consent screen" y configura el consentimiento si aún no lo has hecho.
2. Ve a "APIs & Services" → "Credentials" → "Create credentials" → "OAuth client ID".
3. Tipo de aplicación: "Web application".
4. Añade los Orígenes autorizados de JavaScript:
   - `http://localhost:3000`
   - `https://tu-dominio.com` (producción)
5. Añade los URIs de redireccionamiento autorizados:
   - `http://localhost:3000/auth/callback`
   - `https://tu-dominio.com/auth/callback`
6. Guarda y copia el `Client ID` y el `Client Secret`.
7. En Supabase: "Authentication" → "Providers" → "Google" → pega el `Client ID` y `Client Secret` que acabas de generar y guarda.


## 🛠️ Development

### Recent Updates

- **Initial Sound Setup**: Added automated API endpoint for setting up example sounds for new users
- **File System Integration**: Server-side file operations for uploading sample audio files
- **Duplicate Prevention**: Intelligent checks to prevent re-uploading existing files
- **Storage Optimization**: Efficient file existence checking before upload operations

### Project Structure

```
virtual-stream-deck/
├── app/                    # Next.js App Router (server components)
│   ├── auth/               # Auth routes and callback
│   ├── dashboard/          # Main dashboard page
│   ├── global-error.tsx    # Error boundary
│   ├── globals.css         # Global styles
│   ├── icon.tsx            # App icon
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home
│   └── sitemap.ts          # SEO sitemap
├── components/             # UI components (client)
│   ├── ui/                 # shadcn/ui primitives
│   ├── auth-button.tsx
│   ├── key-config.tsx
│   ├── sound-library.tsx
│   ├── stream-deck-grid.tsx
│   └── theme-provider.tsx
├── core/                   # Clean Architecture core
│   ├── domain/             # Entities and ports (interfaces)
│   ├── application/        # Use cases
│   └── infrastructure/     # Adapters (Supabase, memory)
├── lib/                    # Presentation layer
│   ├── adapters/           # Domain↔UI mappers
│   ├── hooks/              # useSoundLibrary, useKeyConfig, useHotkeys
│   ├── services/           # soundService
│   ├── store.ts            # Zustand store
│   ├── types.ts            # UI types
│   └── utils.ts            # UI utilities
├── pages/                  # API Routes (Pages Router)
│   └── api/
│       └── initial-sounds.ts # Setup example sounds endpoint
├── db/supabase/            # Supabase configuration
│   ├── client.ts
│   ├── connection.ts
│   ├── middleware.ts
│   ├── migrations/
│   ├── schema.ts           # Database schema (Drizzle ORM)
│   └── server.ts
├── features/               # Feature-based organization
│   ├── sounds/             # Sound feature modules
│   └── streamdeck/         # Stream deck feature modules
├── shared/                 # Shared utilities
│   ├── adapters/
│   ├── hooks/
│   ├── services/
│   ├── store.ts
│   ├── types.ts
│   └── utils.ts
├── sound-examples/         # Sample audio files
│   ├── cinematic-hit-3.mp3
│   ├── glass-break.mp3
│   ├── police-sirens.mp3
│   └── thunder.mp4
├── tests/                  # Unit, components, integration
├── public/                 # Static assets
└── config files            # Tailwind, Vitest, Playwright, Biome, Drizzle
```

### Architecture
- **Domain**: Entidades y puertos en `core/domain` definen las reglas de negocio (p. ej., `Sound`, `StreamDeckKey`; puertos `SoundRepository`, `StreamDeckKeyRepository`, `SoundStorage`).
- **Application**: Casos de uso en `core/application` orquestan los puertos de dominio (`UploadSound`, `RemoveSound`, `EnsureStreamDeckKeyForSound`). Lógica pura, sin dependencias de frameworks.
- **Infrastructure**: Adaptadores en `core/infrastructure/supabase|memory` implementan los puertos contra Supabase o memoria. El esquema de BD se define con Drizzle (`utils/supabase/schema.ts`).
- **Presentation**: BLoC y hooks (`lib/hooks/useSoundLibrary.ts`, `lib/hooks/useKeyConfig.ts`) median entre UI y casos de uso; estado global con Zustand (`lib/store.ts`). Mappers en `lib/adapters/index.ts` convierten Domain↔UI. Componentes en `components/` (shadcn/ui, Next.js).

**Flujo típico**
- Subida de sonido: UI → `SoundLibrary.upload` → `UploadSound.execute` → repositorios/almacenamiento → actualización optimista de `store` → refresco desde Supabase.
- Eliminación de sonido: UI → `SoundLibrary.remove` → `RemoveSound.execute` → elimina claves relacionadas y sonido; errores de storage se ignoran para no bloquear la operación.
- Configuración de tecla: UI → `useKeyConfig.save` → `SoundLibrary.updateKey` → persistencia en BD y sincronización de `store`.

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Unit & Component Tests (Vitest)
npm run test             # Watch mode
npm run test:run         # Single run
npm run test:ui          # Visual UI
npm run test:coverage    # Coverage report

# End-to-End Tests (Playwright)
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # UI mode
npm run test:e2e:headed  # Visible browser

# All tests
npm run test:all

# Database (Drizzle)
npm run drizzle:generate
npm run drizzle:push
npm run drizzle:studio

# Type check (no script)
npx tsc --noEmit
```

### Key Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Audio**: Howler.js
- **Drag & Drop**: @dnd-kit
- **File Upload**: react-dropzone
- **File System**: Node.js fs for server-side operations

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
- AAC
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

The app can be deployed to any platform that supports Next.js.

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