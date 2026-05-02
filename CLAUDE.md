# Pijar Teknologi Academy - Learning Management System

## Project Overview
A modern Learning Management System (LMS) built by Pijar Teknologi Academy featuring a cyber-noir glassmorphism design with premium course enrollment functionality.

## Tech Stack
- **Framework**: Next.js 16.2.4 (App Router)
- **React**: 19.2.4
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with custom glassmorphism effects
- **Database**: Supabase PostgreSQL with localStorage fallback
- **UI Components**: Radix UI primitives + shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Inter (via next/font/google)

## Architecture & Key Features

### Authentication System
- **Context**: [AuthContext](context/AuthContext.tsx) - Manages user authentication state
- **Roles**: Admin and User roles with different permissions
- **Login Flow**: Email/password + quick login buttons for testing
- **Admin Emails**: `admin@pijar.id`, `ceo@pijar.id`, `hadi@pijar.id`, `admin@pijarteknologi.id`
- **Admin Password**: `admin@pijarteknologi.id` requires password "123"
- **Storage**: User sessions stored in localStorage

### Database Structure
Tables defined in [supabase_schema.sql](supabase_schema.sql):
- **PIJAR_users**: uid, email, role
- **PIJAR_courses**: id, title, description, enrollmentKey, thumbnailUrl
- **PIJAR_modules**: id, courseId, title, content, mediaUrl, pdfUrl, externalLink, order

**Key**: All DB operations in [lib/db.ts](lib/db.ts) support both Supabase and localStorage fallback for development.

### Core Pages & Routes
- `/` - Root redirect to dashboard
- `/login` - Authentication page with admin/student modes
- `/dashboard` - Main course browsing interface
- `/dashboard/courses/[id]` - Course content viewer with modules
- `/admin` - Course and module management (admin only)

### Component Structure
- `components/ui/` - Reusable UI components (buttons, cards, dialogs)
- `components/layout/` - Layout-specific components:
  - [Sidebar](components/layout/Sidebar.tsx) - Main navigation sidebar
  - [CourseCard](components/layout/CourseCard.tsx) - Course display cards
  - [EnrollModal](components/layout/EnrollModal.tsx) - Enrollment key modal

## Design System

### Color Scheme
- **Background**: #050508 (dark cyber-noir)
- **Primary**: Orange gradient (#FF9933 → #A020F0)
- **Text**: White/gray-200 with semantic grays for hierarchy

### Custom CSS Classes
- `.glass-panel` - Glassmorphism effect with backdrop blur
- `.text-gradient` - Gradient text effect
- `.btn-gradient` - Gradient button with hover effects
- `.aurora-1`, `.aurora-2` - Background ambient lighting effects

### Styling Conventions
- Dark mode aesthetic with glassmorphism panels
- Subtle borders (border-white/5 to border-white/10)
- Backdrop blur for depth effects
- Custom scrollbars
- Orange and purple accent colors for CTAs and highlights

## Key Functionality

### Course Enrollment Flow
1. Users browse courses on dashboard
2. Click "Enroll" to open enrollment modal
3. Enter correct enrollment key (case-insensitive)
4. Course unlocks and redirects to course modules

### Admin Capabilities
- Create/edit/delete courses
- Create/edit/delete modules within courses
- Add media URLs (images/videos), PDF attachments, external links
- Multiple reference links per module
- Delete confirmation modals for destructive actions

### Content Delivery
- Sequential module navigation (prev/next)
- Sidebar outline for module navigation
- Media support (images and video files)
- PDF download links
- External reference links
- Basic markdown rendering (bold, italic, links, headers, lists)

## Development Notes

### Environment Setup
- Copy environment variables from `.env` template
- Supabase credentials: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Local fallback works without Supabase for development

### Database Operations
All DB functions handle both Supabase and localStorage:
- If Supabase is configured, uses Supabase
- Falls back to localStorage for development/testing
- Manual cascade deletion for courses (deletes modules first)

### Important Constraints
- **Next.js 16 Breaking Changes**: API differs from training data - check node_modules/next/dist/docs/
- **Admin Access**: Restricted to specific email addresses or explicit admin role
- **Enrollment Keys**: Case-insensitive comparison
- **Module Ordering**: Auto-incremented order field for sequential display

### File Organization
- `app/` - Next.js App Router pages
- `components/` - React components (ui and layout)
- `context/` - React Context providers
- `lib/` - Utility functions and database operations
- `public/` - Static assets

### Running the Project
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Recent Features (Based on Commit History)
- Enhanced dashboard UI with glassmorphism effects
- Course modules with enrollment key system
- Admin delete confirmation popups
- Multiple external link support per module
- PDF attachment support for learning materials
- Sequential module navigation

## Database Schema Notes
- Foreign key: PIJAR_modules.courseId references PIJAR_courses.id
- ON DELETE CASCADE enabled for modules when course deleted
- Row Level Security policies currently allow all operations (dev mode)
- Production should restrict write operations to authenticated admins

## Code Patterns
- Client components: All page components use `"use client"` directive
- State management: React hooks (useState, useEffect) for component state
- Auth: Context API for global authentication state
- Forms: Controlled components with local state
- Navigation: Next.js useRouter for programmatic navigation
- API: Direct Supabase client calls with fallback to localStorage