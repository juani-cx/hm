# H&M Flow - Editorial Shopping Experience

## Overview

H&M Flow is a mobile-responsive web application that reimagines fashion e-commerce as an editorial, magazine-quality experience. The application combines curated "Flow Stories" (editorial content featuring shoppable looks) with an AI-powered contextual assistant that provides styling guidance, product recommendations, and customer support. Built as a proof-of-concept, the app transforms traditional product browsing into an engaging, Instagram-meets-Vogue-style experience where users discover fashion through visual storytelling backed by live inventory.

The application features a full-screen hero landing, a card-based story feed, immersive story viewers with swipeable looks, detailed product pages, and an intelligent assistant overlay that adapts to user context and preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 3, 2025 - Session 2: Navigation & AI Enhancement**
- Added hamburger menu with H&M logo integration in TopBar
- Created slide-out navigation drawer with menu items (Flow Stories, AI Stylist, Favorites, Settings, Help & Support)
- Implemented prominent AI Suggestions Card on story feed with live API-generated suggestions
- Enhanced assistant button with pulsing animation and indicator dot for visibility
- Added AI Style Tip component that appears contextually in story viewer (5s after viewing)
- Fixed overlay timing to prevent UI conflicts (suggestion toast hides when AI tip appears)
- Added GET endpoint for `/api/assistant/suggestions` to support query-based suggestion fetching
- All interactive elements now include proper data-testid attributes for E2E testing
- Comprehensive testing completed - all navigation and AI features verified end-to-end

**November 3, 2025 - Session 1: Core Implementation**
- Implemented full backend API with stories, items, inventory, and assistant endpoints
- Created multi-agent AI system with GPT-4o integration
- Added inventory service with stock tracking and similar item suggestions
- Fixed product selection flow to use correct SKU from selected look
- Connected frontend to live API data using React Query
- Added comprehensive error handling and logging throughout the stack
- Successfully tested end-to-end flow from hero → stories → products → AI chat

**Technical Decisions**
- Using GPT-4o model (not GPT-5) for compatibility with Replit AI Integrations
- In-memory storage (MemStorage) for POC - can migrate to PostgreSQL for production
- Agent guidelines stored as editable markdown files in `agents/` directory for flexibility
- H&M logo integrated from attached assets (`attached_assets/H&M-Logo_1762206118498.png`)
- AI features designed to be prominent but non-intrusive with staggered timing (3s/5s delays)

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and dev server, configured for HMR and optimized production builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management, data fetching, and caching

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundations (dialogs, dropdowns, popovers, etc.)
- shadcn/ui design system with custom "new-york" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Custom CSS variables for theming (light/dark mode support)
- Framer Motion for animations and transitions

**Design Principles**
- Editorial typography: Playfair Display for headlines, Inter for UI text
- Magazine-quality layouts with full-bleed imagery and editorial spacing
- Mobile-first responsive design
- Accessibility-focused component architecture via Radix UI

**State Management Strategy**
- Server state: TanStack Query with infinite stale time for cached API responses
- Local UI state: React hooks (useState, useEffect) for component-level state
- No global state management library needed due to server-centric data model

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript for type safety across the stack
- Custom middleware for request logging and JSON parsing

**API Design**
- RESTful endpoints organized by resource type:
  - `/api/stories` - Editorial story collections
  - `/api/items` - Product inventory
  - `/api/inventory` - Stock checking and similar item suggestions
  - `/api/assistant` - AI chat and contextual suggestions
  - `/api/profile` - User preferences and profiles

**Data Layer**
- In-memory storage implementation (`MemStorage`) for POC/development
- Interface-driven design (`IStorage`) allows swapping to persistent database
- Drizzle ORM configured for PostgreSQL (via Neon serverless) for production migration
- Schema-first approach with Zod validation on shared types

**AI Assistant System**
- Multi-agent architecture with specialized roles:
  - Fashion agent: Styling advice and outfit recommendations
  - Business agent: Pricing, promotions, and purchasing decisions
  - Support agent: Customer service, orders, and returns
- Agent registry and routing system using intent-based classification
- OpenAI integration via Replit AI Integrations service (GPT-4o model)
- Context-aware responses based on current user activity (story viewing, product browsing)
- Markdown-based agent guidelines stored in `agents/` directory with version control
- Automatic agent guideline loading on server startup
- Intent-based message routing to appropriate agent

**Inventory Service**
- Stock availability checking with three states: available, low_stock, out_of_stock
- Similarity algorithm for finding alternative products based on category, color, material, and price
- Integration points for real-time inventory updates

### External Dependencies

**Third-Party Services**
- **OpenAI (via Replit AI Integrations)**: Powers the contextual assistant with GPT-5 for natural language understanding and generation
- **Neon Database**: Serverless PostgreSQL for production data persistence (configured but not yet migrated from in-memory storage)

**Key Libraries**
- **Drizzle ORM**: Type-safe database queries and schema management
- **Zod**: Runtime schema validation for API payloads and database inserts
- **TanStack Query**: Server state management and request caching
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library for transitions and interactions
- **Tailwind CSS**: Utility-first CSS framework
- **date-fns**: Date formatting and manipulation

**Database Design (PostgreSQL via Drizzle)**
- Items table: Product catalog with SKU, pricing, images, sizes, materials, sustainability tags
- Looks table: Curated outfit combinations linking multiple items
- Stories table: Editorial collections containing multiple looks
- UserProfiles table: User preferences for personalization
- AssistantEvents table: Interaction logging for analytics and improvement

**Asset Management**
- Static images stored in `attached_assets/generated_images/`
- Vite alias configuration for easy asset imports
- Google Fonts for typography (Playfair Display, Inter)

**Development Tools**
- Replit-specific plugins for enhanced development experience (cartographer, dev banner, runtime error overlay)
- ESBuild for production server bundling
- TypeScript strict mode for maximum type safety