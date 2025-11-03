# H&M Flow - Design Guidelines

## Design Approach

**Reference-Based Editorial Experience**
Drawing inspiration from Instagram's visual-first feed, Vogue's editorial layouts, and Net-a-Porter's luxury shopping experience, combined with H&M's accessible fashion DNA. The design prioritizes photography, breathing room, and effortless swipe-based navigation optimized for one-handed mobile use.

**Core Principle**: Magazine-quality editorial meets intelligent, contextual shopping assistance.

---

## Typography

**Editorial Headlines** (Stories, Campaign titles, Hero messaging)
- Font: Playfair Display
- Sizes: text-4xl to text-6xl (mobile), text-5xl to text-7xl (tablet+)
- Weight: font-semibold to font-bold
- Letter-spacing: tracking-tight
- Line-height: leading-tight

**UI Text** (Navigation, body copy, product details, assistant messages)
- Font: Inter
- Body: text-sm to text-base
- Labels/Metadata: text-xs to text-sm
- Product titles: text-lg font-medium
- Weight range: font-normal to font-semibold
- Line-height: leading-relaxed for readability

**Hierarchy Example**
- Story headline: text-5xl font-bold tracking-tight (Playfair)
- Look title: text-xl font-medium (Inter)
- Product name: text-base font-medium (Inter)
- Assistant message: text-sm font-normal (Inter)
- Metadata/tags: text-xs font-normal opacity-70 (Inter)

---

## Layout System

**Spacing Primitives**
Core Tailwind units: **2, 4, 6, 8, 12, 16, 20, 24**

- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Element gaps: gap-2, gap-4, gap-6
- Margins: m-4, m-6, m-8
- Touch targets: min-h-12 (48px minimum)

**Grid & Containers**
- Full-bleed content: w-full
- Contained sections: max-w-md mx-auto px-4 (mobile default)
- Story cards grid: grid-cols-2 gap-4 (mobile), grid-cols-3 gap-6 (tablet+)
- Look items: grid-cols-2 gap-3 (compact display)

**Mobile-First Breakpoints**
- Base (default): 320px+
- sm: 640px (larger phones)
- md: 768px (tablets)
- lg: 1024px (desktop - rare for this POC)

---

## Component Library

### Navigation & Chrome
**Top Bar** (Landing, PDP)
- Height: h-16, sticky top-0, backdrop-blur-md bg-white/90
- H&M logo: h-8, centered or left-aligned
- Icons: Lucide, size-6, touch target p-3
- Search icon, cart icon, profile icon

**Bottom Navigation** (Flow Stories, optional)
- Height: h-16, fixed bottom-0, bg-white border-t
- 3-5 nav items with Lucide icons + labels
- Active state: text-[#CC071E] with subtle underline

### Landing Page
**Hero Section**
- Full viewport: min-h-screen or h-screen with overflow handling
- Large hero image: full-bleed, object-cover
- Headline overlay: absolute bottom-0, p-6, bg-gradient-to-t from-black/60
- CTA button: blurred background (backdrop-blur-md bg-white/20), large touch target (min-h-12 px-8)

**Flow Entry Tile**
- Card: aspect-square or aspect-[4/5], rounded-2xl overflow-hidden
- Image: object-cover with overlay gradient
- Title: absolute bottom-0, p-4, text-white text-2xl font-bold (Playfair)

### Story Feed (Editorial Cards)
**Card Design**
- Aspect ratio: aspect-[3/4] or aspect-[4/5]
- Border radius: rounded-2xl
- Shadow: shadow-sm, hover:shadow-md transition
- Image: object-cover, full card height
- Overlay gradient: bg-gradient-to-t from-black/50 to-transparent
- Text overlay: absolute bottom-0, p-4
- Title: text-xl font-bold text-white (Playfair)
- Metadata: text-xs text-white/80 (e.g., "6 looks · Sustainability")

**Loading States**
- Shimmer: animate-pulse bg-gray-200 rounded-2xl aspect-[3/4]

### Story Viewer (Full-Screen)
**Layout**
- Full viewport: h-screen w-screen, swipeable horizontally
- Background: bg-black (for letterboxing if needed)
- Story image/video: object-contain max-h-[70vh]
- Bottom controls: absolute bottom-0, p-6, bg-gradient-to-t from-black/80

**Interactive Elements**
- Progress bars: top-0, h-1, grid grid-cols-[number of slides]
- Close button: top-4 right-4, backdrop-blur-md bg-black/20 rounded-full p-2
- Look chips: horizontal scroll, flex gap-2, py-4
- "Shop the Look" CTA: prominent, backdrop-blur-md bg-white/90 text-black rounded-full px-6 py-3 font-medium

### Look Card / Outfit Composer
**Item Grid**
- Grid: grid-cols-2 gap-3
- Item card: aspect-square, rounded-xl overflow-hidden
- Image: object-cover
- Overlay actions: absolute top-2 right-2
- Price: absolute bottom-2 left-2, backdrop-blur-sm bg-black/60 text-white text-sm px-2 py-1 rounded
- Sustainability badge: absolute top-2 left-2, green indicator

**Swap Controls**
- Tap item to expand alternate views
- Size selector: horizontal pill group, gap-2, active state with bg-[#CC071E] text-white
- Similar items: carousel, gap-3, horizontal scroll

### Product Detail Page (PDP)
**Image Gallery**
- Carousel: snap-x snap-mandatory, scrollbar-hide
- Images: aspect-[3/4], object-cover, rounded-xl
- Indicators: flex gap-2, h-1.5 rounded-full, active bg-[#CC071E]

**Product Info**
- Container: p-6
- Name: text-2xl font-medium mb-2
- Price: text-3xl font-bold text-[#CC071E] mb-4
- Description: text-sm leading-relaxed mb-6
- Size selector: same as Look Card
- Add to cart: w-full h-14 bg-black text-white rounded-full font-medium, hover state with subtle scale

**Sustainability Callout**
- Card: bg-[#F6F6F6] rounded-xl p-4 mb-6
- Icon + text: flex gap-3, text-sm

### Assistant Overlay
**Chat Bubble (Minimized)**
- Fixed: bottom-20 right-4 (or bottom-4 if no nav)
- Circle: size-14 rounded-full bg-[#CC071E] shadow-lg
- Icon: Lucide MessageCircle, text-white

**Expanded Chat**
- Sheet: slide up from bottom, rounded-t-3xl
- Height: max-h-[70vh]
- Header: p-4 border-b, "H&M Style Assistant"
- Messages: p-4 space-y-4
- User message: ml-auto bg-[#CC071E] text-white rounded-2xl px-4 py-2 max-w-[80%]
- Assistant message: bg-[#F6F6F6] rounded-2xl px-4 py-2 max-w-[80%]
- Typing indicator: three dots animation
- Suggestion chips: flex gap-2 flex-wrap, bg-white border rounded-full px-4 py-2 text-sm

**Context Prompts (Inline)**
- Toast: absolute bottom-24, left-1/2 -translate-x-1/2
- Style: backdrop-blur-md bg-white/90 shadow-lg rounded-full px-6 py-3
- Dismiss: tap outside or swipe down

### Profile & Preferences
**Conversational Input**
- Large input area: min-h-24 rounded-xl bg-[#F6F6F6] p-4
- Examples: text-xs text-gray-500 mb-2
- Chips for quick answers: grid grid-cols-2 gap-2

### AI Campaign/Video Page
**Video Player**
- Full viewport initially: aspect-video max-h-[60vh]
- Controls: overlay with play/pause, progress bar
- Shoppable moments: tap zones with product chips appearing on pause
- Mini-player: fixed bottom-20 right-4, size-24 rounded-xl, tap to expand

**Scene Products**
- Grid below video: grid-cols-3 gap-2
- Small product cards with quick-add

---

## Animations (Framer Motion)

**Use Sparingly**
- Story card enter: fade + slide up, stagger children
- Story swipe: page transition with momentum
- Look item swap: cross-fade, duration 200ms
- Assistant appear: slide up + fade, spring config
- Add to cart: subtle scale feedback (0.98)
- Size pill select: scale 1.05

**No animations for**: scrolling, standard taps, text rendering

---

## Images

**Strategy**: Photography-first, full-bleed images throughout

**Hero Section** (Landing)
- Large editorial fashion image, full-screen, with model in H&M outfit
- Atmospheric, aspirational quality

**Story Cards**
- Editorial lifestyle photography from H&M catalog
- Models in styled outfits, location-based or studio
- Varied scenes: urban, natural, interior

**Story Viewer**
- High-resolution editorial shots, portrait orientation preferred
- Mix of full-body outfit shots and detail/texture close-ups

**Look Items & PDP**
- Clean product photography on white/neutral background
- Multiple angles: front, back, detail shots
- Lifestyle context shots mixed in

**Campaign/Video**
- Cinematic B-roll footage of models, fashion shows, or seasonal campaigns
- Shoppable overlay moments with product stills

All images should be optimized for mobile (WebP, lazy loading, responsive srcset).

---

## Color Application

**Primary Accent**: H&M Red (#CC071E)
- CTAs, active states, brand moments, selected items, assistant bubble

**Foundation**
- Black (#000000): text, navigation, strong CTAs
- White (#FFFFFF): backgrounds, overlays, text on dark
- Cool Gray (#F6F6F6): backgrounds, cards, input fields

**Usage**
- Minimal color overall - let photography provide color
- Red used strategically for key actions and brand touchpoints
- Generous white space and gray backgrounds for breathing room

---

## Accessibility

- Minimum touch target: 48px (h-12)
- Focus rings: visible, 2px offset, color matching context
- Contrast ratios: AA compliant (4.5:1 text, 3:1 UI elements)
- Alt text: descriptive for all product and editorial images
- Video captions: available for campaign content
- Form validation: inline errors with clear messaging
- Screen reader: semantic HTML, ARIA labels where needed