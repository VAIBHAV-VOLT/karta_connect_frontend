# Karta Connect Frontend

A modern React-based talent portal frontend for **Karta Connect** — connecting students with scholarship and job opportunities. Built with React, TanStack Router, and Tailwind CSS with a comprehensive UI component library powered by Radix UI.

> **Note:** This is the frontend repository. For the backend API, see [KartaConnect Backend](https://github.com/VAIBHAV-VOLT/karta_connect_backend) (update repository URL).

## 🎯 Overview

Karta Connect is a multi-role portal supporting three key user types:

- **Students**: Browse job/scholarship opportunities, apply, manage applications, track progress
- **Companies**: Post opportunities, manage applications, view scholars, manage company profile
- **Admin**: Moderation, analytics, user management, content oversight

## 🛠 Tech Stack

- **Frontend Framework**: React 19
- **Routing**: TanStack Router (with auto-generated route tree)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + TailwindCSS Vite plugin
- **UI Components**: Radix UI (headless, accessible components)
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Supabase JS client
- **Data Visualization**: Recharts
- **Date Handling**: date-fns
- **Export**: XLSX
- **Notifications**: Sonner
- **Language**: JavaScript/TypeScript

## 📁 Project Structure

```
karta_connect_frontend/
├── index.html                    # HTML entry point
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.js                # Vite build config
├── nginx.conf                    # Nginx configuration for deployment
├── Dockerfile                    # Docker containerization
├── eslint.config.js              # ESLint configuration
├── .env.example                  # Example environment variables
├── README.md                     # This file
│
├── public/                       # Static assets
│   └── favicon, images, etc.
│
└── src/
    ├── main.jsx                  # React app entry point
    ├── router.jsx                # TanStack Router setup
    ├── routeTree.gen.js          # Auto-generated route definitions
    ├── routeTree.gen.ts          # TypeScript route type definitions
    ├── styles.css                # Global styles
    │
    ├── components/               # Reusable React components
    │   ├── app-shell.jsx         # Main app layout wrapper
    │   └── ui/                   # UI component library (Radix UI based)
    │       ├── alert.jsx
    │       ├── avatar.jsx
    │       ├── badge.jsx
    │       ├── button.jsx
    │       ├── card.jsx
    │       ├── chart.jsx
    │       ├── command.jsx
    │       ├── dialog.jsx
    │       ├── drawer.jsx
    │       ├── form.jsx
    │       ├── input.jsx
    │       ├── menubar.jsx
    │       ├── popover.jsx
    │       ├── select.jsx
    │       ├── separator.jsx
    │       ├── sidebar.jsx
    │       ├── skeleton.jsx
    │       ├── table.jsx
    │       ├── tabs.jsx
    │       ├── toast.jsx
    │       └── [other UI components]
    │
    ├── hooks/                    # Custom React hooks
    │   ├── use-auth.js           # Authentication context hook
    │   └── use-mobile.jsx        # Mobile responsiveness detection
    │
    ├── integrations/             # Third-party service integrations
    │   └── supabase/
    │       ├── client.js         # Supabase client initialization
    │       └── auth-attacher.js  # Auth setup & listeners
    │
    ├── lib/                      # Utility functions & helpers
    │   ├── api-client.js         # HTTP client for API calls
    │   ├── config.server.js      # Server configuration
    │   ├── error-capture.js      # Error handling utilities
    │   ├── error-page.js         # Error page component
    │   ├── route-guards.js       # Route protection & middleware
    │   ├── storage-paths.js      # Local storage key definitions
    │   ├── utils.js              # General utility functions
    │   └── api/
    │       ├── index.js          # API endpoints index
    │       └── karta.functions.js # Karta-specific API functions
    │
    └── routes/                   # Page components (file-based routing)
        ├── __root.jsx            # Root layout
        ├── index.jsx             # Landing page
        ├── login.jsx             # Login page
        ├── signup.jsx            # Sign up page
        ├── forgot-password.jsx    # Password recovery
        ├── reset-password.jsx     # Reset password flow
        ├── create-password.jsx    # Initial password setup
        │
        ├── _authenticated.jsx    # Protected routes wrapper
        ├── _authenticated.dashboard.jsx
        ├── _authenticated.settings.jsx
        │
        ├── _authenticated.admin.analytics.jsx
        ├── _authenticated.admin.companies.*.jsx
        ├── _authenticated.admin.moderation.jsx
        ├── _authenticated.admin.posts.*.jsx
        ├── _authenticated.admin.students.*.jsx
        │
        ├── _authenticated.company.applications.jsx
        ├── _authenticated.company.posts.jsx
        ├── _authenticated.company.profile.jsx
        ├── _authenticated.company.scholars.jsx
        ├── _authenticated.company.support.jsx
        │
        └── _authenticated.student.*.jsx
            ├── applications.jsx
            ├── jobs.index.jsx
            ├── jobs.$id.apply.jsx
            ├── profile.jsx
            ├── progress.jsx
            └── saved.jsx

└── dist/                        # Build output (generated)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account for authentication
- Backend API running (see Backend Setup below)

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
- Production: `http://13.201.18.131:5000`

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

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t karta-connect-frontend:latest .
```

### Run Container Locally
```bash
docker run -p 80:80 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_anon_key \
  -e VITE_API_URL=http://your-backend-url \
  karta-connect-frontend:latest
```

The application will be available at `http://localhost`

### Docker Compose
To run with backend API:
```bash
docker-compose up
```

See `docker-compose.yml` in the root directory for full configuration.

## 🚀 Production Deployment

### 1. Build
```bash
npm run build
```

### 2. Verify Build
```bash
npm run preview
```

### 3. Deploy to Vercel
```bash
vercel deploy --prod
```

### 4. Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

### 5. Deploy via Docker (Recommended)
```bash
# Build and tag image
docker build -t your-registry/karta-connect-frontend:latest .

# Push to registry
docker push your-registry/karta-connect-frontend:latest

# Deploy (using your platform's CLI or manual deployment)
```

### Production Environment Variables
Set these in your hosting platform's environment configuration:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_API_URL` - Production backend API URL (e.g., `https://api.yourdomain.com`)

## 🔗 Backend Repository

This frontend works with the **KartaConnect Backend API**. To set up the complete system:

### Backend Setup
1. Clone the backend repository: `https://github.com/VAIBHAV-VOLT/karta_connect_backend`
2. Follow backend README for setup instructions
3. Ensure backend is running before starting frontend development
4. Update `VITE_API_URL` to point to your backend instance

### API Documentation
The backend API documentation is available at `{VITE_API_URL}/api/docs`

### Required Backend Endpoints
- `POST /api/auth/resolve-login` - Check if email exists
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/student/profile` - Get student profile
- `GET /api/company/profile` - Get company profile
- `GET /api/jobs` - List job opportunities
- `POST /api/applications` - Submit application
- And more... (see backend documentation)

## 🐛 Troubleshooting

### CORS Errors
**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**
- Ensure `VITE_API_URL` in frontend matches backend's expected origin
- Verify backend has CORS configured for this frontend's domain
- Check backend's `CORS_ORIGIN` or similar CORS configuration

### Supabase Connection Issues
**Problem:** "Cannot connect to Supabase" or auth errors

**Solution:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify API Keys have not been revoked
- Check browser console for detailed error messages

### Blank Page After Build
**Problem:** Production build shows blank page

**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for JavaScript errors
- Verify all environment variables are set correctly
- Try: `npm run build && npm run preview`

### Build Fails
**Problem:** Build command fails with errors

**Solution:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Try building again
npm run build
```

### Port Already in Use
**Problem:** "Port 5173 is already in use"

**Solution:**
```bash
# Change port in .env
VITE_PORT=5174

# Or kill the process using the port
# Windows: netstat -ano | findstr :5173
# macOS/Linux: lsof -i :5173
```

### Hot Module Replacement (HMR) Not Working
**Problem:** Changes not reflecting without page reload

**Solution:**
- Ensure you're running `npm run dev` (not build)
- Check firewall settings if using remote development
- Restart dev server: Stop process and run `npm run dev` again

### Typescript Errors
**Problem:** TypeScript compilation errors

**Solution:**
- Check `tsconfig.json` is properly configured
- Run: `npm run build` to see detailed errors
- Type errors won't block dev server, but will block production builds

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [TanStack Router Guide](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI Components](https://radix-ui.com)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query)

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run linting: `npm run lint`
4. Format code: `npm run format`
5. Commit with clear messages
6. Push and create a Pull Request

## 📋 Code Style

- **Linting:** ESLint configured in `eslint.config.js`
- **Formatting:** Prettier for consistent formatting
- **Pre-commit hooks:** Consider setting up Husky to run lint on commit

## 🆘 Support & Issues

- For frontend issues, open an issue in this repository
- For backend API issues, see the [Backend Repository](https://github.com/VAIBHAV-VOLT/karta_connect_backend)
- Check existing issues before creating a new one

## 📄 License

ISC
