# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Safhira is a sexual health education platform for Malaysian youth aged 18-25. Built with Next.js 14, it provides stigma-free STI education, testing resources, and culturally sensitive support through an interactive web application.

## Development Commands

**Package Manager**: Use `pnpm` (not npm or yarn)

```bash
# Development
pnpm dev                # Start dev server with turbo mode
pnpm build             # Build for production
pnpm start             # Start production server
pnpm lint              # Run ESLint

# Database Operations
pnpm db:generate       # Generate Drizzle migration files
pnpm db:migrate        # Run database migrations
pnpm db:push           # Push schema changes directly to database
pnpm db:studio         # Open Drizzle Studio for database inspection
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + Shadcn/ui + Radix UI
- **Authentication**: Custom session management
- **Animations**: Framer Motion

### Key Directories
```
app/
|-- components/        # React components organized by feature
|   |-- ui/           # Shadcn/ui components
|   |-- figma/        # Design system components
|-- chat/             # AI chat feature pages
|-- stis/             # STI information pages with dynamic routing
|-- layout.tsx        # Root layout with theme provider

db/
|-- schema.ts         # Database schema definitions
|-- migrations/       # Generated migration files

lib/
|-- utils.ts          # Utility functions
|-- db-utils.ts       # Database helper functions
|-- prevalence-data.ts # STI prevalence data for Malaysia
```

### Database Schema
- `users` table: User management with email/name
- `sessions` table: Session tracking with expiration
- Schema located in `db/schema.ts`
- Uses Drizzle ORM for type-safe database operations

### Component Architecture
- Server Components by default (RSC)
- Client components marked with 'use client' only when necessary
- Suspense boundaries for loading states
- Theme system with dark/light mode support

### Navigation System
- Single-page application with URL-based section routing
- Smooth page transitions using Framer Motion
- Sections: home, quiz, basics, prevention, testing, myths

## Development Guidelines

### Code Style (from .cursorrules)
- Use TypeScript for all code; prefer interfaces over types
- Functional and declarative programming patterns
- Use descriptive variable names (isLoading, hasError)
- Lowercase with dashes for directories (auth-wizard)
- Named exports for components

### UI/UX Patterns
- Mobile-first responsive design with Tailwind CSS
- Gradients: `from-pink-50 via-white to-teal-50` (light), `from-gray-900 via-gray-800 to-gray-900` (dark)
- Primary colors: Teal and Pink variants
- Smooth scrolling and page transitions

### Performance
- Minimize 'use client' usage - prefer Server Components
- Wrap client components in Suspense with fallback
- Optimize images with WebP format and lazy loading
- Dynamic loading for non-critical components

## Database Environment

Set `DATABASE_URL` in `.env.local`:
```
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

The app supports Vercel Postgres, Neon, and other PostgreSQL providers.