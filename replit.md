# H&M Flow - Editorial Shopping Experience

## Overview
H&M Flow is a mobile-responsive web application that redefines fashion e-commerce as an editorial, magazine-quality experience. It merges curated "Flow Stories" with an AI-powered contextual assistant for styling guidance and product recommendations. Designed as a proof-of-concept, the app aims to transform traditional product browsing into an engaging, visual storytelling experience, akin to "Instagram meets Vogue," with real-time inventory. Key features include a full-screen hero landing, a card-based story feed, immersive story viewers, detailed product pages, and an intelligent assistant overlay. The project's ambition is to create an immersive shopping experience that leverages AI for personalized fashion discovery and customer support.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript, using Vite for building and Wouter for routing. TanStack Query manages server state, data fetching, and caching. The UI relies on Radix UI for accessible component foundations, shadcn/ui for design, and Tailwind CSS for styling. Design principles emphasize editorial typography (Playfair Display, Inter), magazine-quality layouts, mobile-first responsiveness, and accessibility. State management primarily uses TanStack Query for server state, React Context (CartContext) for global shopping cart state, and React hooks for local UI state. The shopping cart uses functional state updates to ensure atomic operations and prevent race conditions during rapid add-to-cart interactions.

### Backend Architecture
The backend uses Express.js with TypeScript. It features RESTful APIs for stories, items, inventory, AI assistant interactions, and user profiles. Data is currently stored in-memory using `MemStorage` (with an interface for future PostgreSQL migration via Drizzle ORM). The AI Assistant System is a multi-agent architecture (Fashion, Business, Support) using OpenAI (GPT-4o via Replit AI Integrations) for intent-based routing and context-aware responses, with guidelines stored in Markdown files. An Inventory Service handles stock availability and similar product recommendations.

### Technical Decisions
- OpenAI API key (OPENAI_API_KEY_LUCAS) is used for GPT-4o chat completions and DALL-E 3 image generation.
- In-memory storage for POC, with Drizzle ORM configured for PostgreSQL for production.
- User settings are persisted in the database via UserProfile schema and accessible from all pages.
- Agent guidelines are editable markdown files for flexibility.
- AI features are prominent but non-intrusive, with staggered timings.
- Cart items are uniquely identified by composite `${sku}-${size}` keys.
- User behavior (add_to_cart, save_for_later, save_to_collection) is tracked for agent learning.
- Virtual try-on generates 1024x1024 photorealistic previews using DALL-E 3.

### UI/UX Decisions
- Editorial typography: Playfair Display for headlines, Inter for UI text.
- Magazine-quality layouts with full-bleed imagery.
- Mobile-first responsive design.
- Accessible component architecture via Radix UI.
- Custom CSS variables for theming.
- Framer Motion for animations and transitions.
- H&M logo and favicon for consistent branding.

### Feature Specifications
- **Onboarding Wizard:** 4-step modal wizard that auto-opens after 2 seconds on home page:
  - Step 1: Desired Experience & Style Preferences (Ultra personalized, Non intrusive, Traditional, Casual & comfy, Minimalist, Playful, Fashionist)
  - Step 2: Size and Flow (Gender, Body Type, Tops/Bottoms sizes, Fit preference slider)
  - Step 3: Product Pages & Collections style (Magazine, Board, Virtual gallery)
  - Step 4: Insights Preferences (Fashion recommendations, Pricing first, Fit my style)
  - Session-tracked to show only once per session using sessionStorage
  - All preferences saved to user profile upon completion
  - Skip and Next navigation with red H&M branded buttons
  - Accessible with proper ARIA labels for screen readers
- **Flow Stories:** Curated editorial content featuring shoppable looks.
- **AI-Powered Assistant:** Styling guidance, product recommendations, customer support.
- **Collections:** Editorial model photography, interactive modules, and viewer with actions (Add to My Collection, Save for Later, Add to Cart, Virtual AI Assist).
- **Magazine Article Viewer (Campaign Article):** Immersive full-screen content experience with:
  - Hero image with settings, share, save, and favorite actions
  - Settings icon opens modal dialog for persistent preferences (no page navigation)
  - Collection tags displayed below image (non-clickable, tag-style indicators)
  - Interactive image gallery with multiple viewing modes (magazine, board, virtual gallery) based on user preferences
  - AI image editing capabilities with custom prompt input
  - Video player support for editorial content
  - Shoppable product cards with one-click add-to-cart
  - Smooth animations and transitions using Framer Motion
- **Global Shopping Cart:** React Context-based cart system with:
  - Atomic state updates using functional setState to prevent race conditions
  - Persistent cart across all pages
  - Real-time cart count badge in navigation
  - Quick add-to-cart with automatic cart drawer opening
  - Cart accessible from all pages via TopBar
- **Virtual Try-On:** AI-generated outfit previews on various model avatars (Athletic, Petite, Curvy, Tall & Slim, Plus Size) with:
  - Initial configuration directly in preview area (before first generation)
  - Settings dialog accessible via gear icon with contextual CTA:
    - "Save to Profile" for initial setup
    - "Apply Changes" when updating existing preview
  - Smooth regeneration UX: old image remains visible with loading overlay while new image generates
  - Spinner overlay displays "Generating new preview..." during regeneration
  - Image updates seamlessly once new preview is ready
- **AI Stylist Page:** Outfit builder with item selection, real-time outfit calculation, AI suggestions, and save/add-to-cart options.
- **Shopping Cart:** Drawer overlay, quantity controls, remove items, subtotal/shipping/total, AI styling tips, and "Complete the Look" suggestions.
- **User Profile & Settings:** Modal dialog for settings with persistent storage in database:
  - Implemented as a modal overlay (not a dedicated page) to keep users in context
  - SettingsContext manages global modal state across the application
  - AI Stylist Model selection (Clara, Sofia, Emma, Alex)
  - Curated feed personalization toggle
  - Favorite style preferences (Minimalist, Streetwear, Vintage, etc.)
  - Media preview type (Image or Video)
  - Gender selection (Man, Woman, No Gender/Mannequin) for AI-generated previews
  - Clothing size preferences (Tops and Bottoms)
  - Fit preference slider (Tighter to Looser)
  - Preview configuration settings (Body, Style, Mood, Inspiration)
  - All settings saved to database and synced across all pages
  - Accessible via Settings icon in campaign articles and navigation menus
  - Floating X close button in top right corner
  - Scrollable content with sticky header

## External Dependencies

### Third-Party Services
- **OpenAI**: Direct API integration using user's API key (OPENAI_API_KEY_LUCAS) for GPT-4o chat completions and DALL-E 3 image generation.
- **Neon Database**: Serverless PostgreSQL for production data persistence (configured for migration).

### Key Libraries
- **Drizzle ORM**: Type-safe database queries.
- **Zod**: Runtime schema validation.
- **TanStack Query**: Server state management.
- **Radix UI**: Accessible component primitives.
- **Framer Motion**: Animation library.
- **Tailwind CSS**: Utility-first CSS.
- **Wouter**: Lightweight client-side routing.

### Asset Management
- Static images stored locally.
- Google Fonts for typography.