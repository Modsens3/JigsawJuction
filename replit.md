# Overview

PuzzleCraft is a Greek e-commerce web application for creating personalized jigsaw puzzles. Users can upload their own photos or choose from pre-designed templates to create custom puzzles in different materials (wood, acrylic, paper), sizes, and piece counts. The application features a modern React frontend with a Node.js/Express backend and uses PostgreSQL for data storage.

# User Preferences

Preferred communication style: Simple, everyday language.
Admin panel requirements: Separate admin authentication system at /admin route with username/password protection.
Navigation preferences: Removed "Γενήτρια Παζλ", "Προσαρμογέας", "Κοινότητα", and "Επεξεργαστής Εικόνας" tabs from main navigation menu.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: Zustand for cart state management
- **Data Fetching**: TanStack Query (React Query) for server state management and API caching
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with dedicated routes for templates, orders, and cart management
- **File Uploads**: Multer middleware for handling image uploads with validation
- **Development**: Hot module replacement via Vite integration in development mode

## Data Storage
- **Database**: PostgreSQL with Neon Database as the cloud provider
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Validation**: Drizzle-Zod for runtime schema validation
- **Session Storage**: In-memory storage for development with interface for future database implementation

## Component Architecture
- **Design System**: Modular component library using shadcn/ui pattern
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Internationalization**: Greek language content with semantic HTML structure

## Key Features
- **Product Configurator**: Multi-step wizard for customizing puzzle specifications
- **Template Gallery**: Filterable collection of pre-designed puzzle templates
- **Shopping Cart**: Persistent cart state with quantity management
- **File Upload**: Image upload with validation for custom puzzles
- **Pricing Calculator**: Dynamic pricing based on material, size, and piece count

## Development Workflow
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Full TypeScript coverage with shared types between frontend and backend
- **Code Quality**: ESLint and TypeScript compiler checks
- **Development Server**: Integrated Vite dev server with Express backend proxy

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Build Tools**: Vite, TypeScript, esbuild for production builds
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer for styling infrastructure

## UI Component Libraries
- **Radix UI**: Comprehensive primitive components for accessibility and functionality
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library for rapid development

## Backend Infrastructure
- **Express.js**: Web application framework with middleware support
- **Multer**: File upload handling middleware
- **CORS**: Cross-origin resource sharing configuration

## Database Stack
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and queries
- **Drizzle Kit**: Database migration and schema management tools

## Development Tools
- **Replit Integration**: Replit-specific plugins for development environment
- **Wouter**: Lightweight routing library for single-page application navigation
- **Date-fns**: Date manipulation utilities for timestamp handling

## State Management
- **Zustand**: Lightweight state management for cart functionality
- **TanStack Query**: Server state management with caching and synchronization