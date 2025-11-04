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
- GPT-4o for AI chat and GPT-image-1 for virtual try-on image generation (handling base64 outputs).
- In-memory storage for POC, with Drizzle ORM configured for PostgreSQL for production.
- Agent guidelines are editable markdown files for flexibility.
- AI features are prominent but non-intrusive, with staggered timings.
- Cart items are uniquely identified by composite `${sku}-${size}` keys.
- User behavior (add_to_cart, save_for_later, save_to_collection) is tracked for agent learning.
- Virtual try-on generates 1024x1024 photorealistic previews.

### UI/UX Decisions
- Editorial typography: Playfair Display for headlines, Inter for UI text.
- Magazine-quality layouts with full-bleed imagery.
- Mobile-first responsive design.
- Accessible component architecture via Radix UI.
- Custom CSS variables for theming.
- Framer Motion for animations and transitions.
- H&M logo and favicon for consistent branding.

### Feature Specifications
- **Flow Stories:** Curated editorial content featuring shoppable looks.
- **AI-Powered Assistant:** Styling guidance, product recommendations, customer support.
- **Collections:** Editorial model photography, interactive modules, and viewer with actions (Add to My Collection, Save for Later, Add to Cart, Virtual AI Assist).
- **Magazine Article Viewer:** Immersive full-screen content experience with:
  - Hero image with share, save, and favorite actions
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
- **Virtual Try-On:** AI-generated outfit previews on various model avatars (Athletic, Petite, Curvy, Tall & Slim, Plus Size).
- **AI Stylist Page:** Outfit builder with item selection, real-time outfit calculation, AI suggestions, and save/add-to-cart options.
- **Shopping Cart:** Drawer overlay, quantity controls, remove items, subtotal/shipping/total, AI styling tips, and "Complete the Look" suggestions.
- **User Profile Agent:** Learns and stores user preferences, style choices, and shopping behavior.

## External Dependencies

### Third-Party Services
- **OpenAI (via Replit AI Integrations)**: Powers the contextual assistant (GPT-4o) and image generation (gpt-image-1).
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