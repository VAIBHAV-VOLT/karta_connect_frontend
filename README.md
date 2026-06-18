# Karta Connect Frontend

React + TanStack Router frontend for the Karta Connect talent portal.

## Project Structure

```
karta_connect_frontend/
├── index.html               # HTML entry point
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.js           # Vite build configuration
├── eslint.config.js         # ESLint configuration
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Example environment configuration
├── .gitignore               # Git ignore rules
├── README.md                # This file
├── public/                  # Static assets
│   └── karta-logo.png
├── src/
│   ├── main.jsx             # React app entry point
│   ├── router.jsx           # TanStack Router configuration
│   ├── routeTree.gen.js     # Auto-generated route tree
│   ├── routeTree.gen.ts     # Route tree TypeScript definitions
│   ├── styles.css           # Global styles
│   ├── components/          # React components
│   │   ├── app-shell.jsx
│   │   └── ui/              # UI component library
│   ├── hooks/               # Custom React hooks
│   │   ├── use-auth.js
│   │   └── use-mobile.jsx
│   ├── integrations/        # Third-party integrations
│   │   └── supabase/
│   │       ├── auth-attacher.js
│   │       └── client.js
│   ├── lib/                 # Utility functions
│   │   ├── config.server.js
│   │   ├── error-capture.js
│   │   ├── error-page.js
│   │   ├── storage-paths.js
│   │   ├── utils.js
│   │   └── api/
│   │       └── karta.functions.js
│   └── routes/              # Page components/routes
└── dist/                    # Build output directory
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001)

### 3. Start Development Server

```bash
npm run dev
```

Application will run on http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

Compiled files will be in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Key Changes from Monorepo

### 1. **Vite Configuration**
Removed `envDir: "../"` to load environment variables from frontend directory only.

**Before:**
```javascript
export default defineConfig({
  envDir: "../",
  // ...
});
```

**After:**
```javascript
export default defineConfig({
  // envDir removed - uses .env in frontend directory
  // ...
});
```

### 2. **Environment Variables**
Now uses independent `.env` file instead of root monorepo `.env`.

### 3. **Backend API URL**
Update `VITE_API_URL` to point to your backend server:
- Local development: `http://localhost:3001`
- Production: `https://your-backend-domain.com`

### 4. **Supabase Integration**
Frontend needs its own Supabase keys:
- `VITE_SUPABASE_URL` - Same as backend
- `VITE_SUPABASE_ANON_KEY` - Same as backend (used for client-side operations)

## Features

- **Authentication** - Supabase auth integration with role-based access
- **Job Listings** - Browse and search job/internship opportunities
- **Applications** - Apply for positions with cover notes
- **Student Profiles** - Complete profile with skills, achievements, resume
- **Company Profiles** - Manage company information and job postings
- **Admin Dashboard** - Manage users, posts, and whitelist
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **Real-time Updates** - WebSocket support via Supabase

## Technology Stack

- **React** 19.x - UI framework
- **TanStack Router** - File-based routing
- **TanStack Query** - Data fetching and caching
- **Supabase** - Backend & authentication
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Vite** - Build tool

## Authentication Flow

1. User enters email
2. Frontend checks if email exists via `/api/auth/resolve-login`
3. User creates password or signs up
4. Backend creates Supabase user and assigns role
5. Frontend stores auth token
6. Subsequent requests use Bearer token in Authorization header

## API Integration

All API calls should use the backend URL from environment via the centralized helper in `src/lib/api-client.js`.

```javascript
import { buildApiUrl } from '@/lib/api-client';

const response = await fetch(buildApiUrl('/api/student/profile'), {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

For authenticated requests, use `authenticatedFetch('/api/...')` to automatically include the Supabase access token.

## Development Tips

### Dev server port
The frontend port can be configured with `VITE_PORT` in `.env` or `.env.local`.

```env
VITE_PORT=5173
```

If unset, Vite defaults to `5173`.

### Adding New Routes
Routes are auto-generated from file names in `src/routes/`:
- `_authenticated.jsx` - Protected route wrapper
- `_authenticated.student.profile.jsx` - `/student/profile`
- `_authenticated.admin.dashboard.jsx` - `/admin/dashboard`

### Component Library
UI components are in `src/components/ui/` using Radix UI primitives with Tailwind styling.

### Styling
- Use Tailwind utility classes for styling
- Global styles in `src/styles.css`
- Component-specific styles in component files

## Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

### Environment Variables on Hosting
Set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (update to production backend URL)

## Common Issues

### CORS Errors
Make sure `VITE_API_URL` matches the backend's expected CORS origin and backend's `FRONTEND_URL` matches this frontend.

### Supabase Auth Errors
Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct.

### Build Errors
Clear cache and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## License
ISC
