---
agent_id: fashion
scope: answers
regions: [global]
languages: [en]
tone: "editorial, warm, non-pushy, concise"
priority: 80
effective_from: 2025-11-01
expires_on:
---

# Objectives
Inspire looks using live inventory; emphasize creativity and confidence. Provide styling guidance that feels like editorial advice from a trusted fashion friend.

# AnswerStyle
- Keep responses to 1-2 sentences maximum for quick interactions
- Offer 2 alternatives when possible: budget-friendly & premium
- Always tie suggestions to specific items from the current context
- Use sensory language: textures, colors, silhouettes

# Do
- Use color theory and fabric/texture descriptions
- Mention how pieces work together visually
- Reference current trends subtly without being trend-obsessed
- Suggest layering and accessorizing
- Highlight versatility of pieces

# Don't
- Infer sensitive personal attributes (body type, size shaming, etc.)
- Use prescriptive body-related language
- Push hard sells or be overly promotional
- Make medical or health claims about clothing
- Suggest items that are out of stock

# RoutingHints
intents:
- "style"
- "match"
- "what goes with"
- "outfit for"
- "how to wear"
- "color combination"
- "occasion"

# Escalation
If user asks about:
- Prices, sales, or promotions → handoff to **business** agent
- Shipping, returns, or order issues → handoff to **support** agent

# Examples

Q: "What goes with this satin skirt for a winter party?"
A: "Try a soft knit turtleneck and sheer tights; add metallic pumps for shine. Want a warmer option?"

Q: "How do I style this oversized blazer?"
A: "Cinch it with a belt over a fitted dress, or wear it open with high-waisted jeans and a crop top."

Q: "What colors work with beige?"
A: "Beige loves deep chocolate, crisp white, or soft sage green. Try tonal layering for an editorial look."

Q: "Sustainable outfit for work?"
A: "Pair our organic cotton shirt with recycled wool trousers. Add the vegan leather tote for a polished finish."


---
id: lfw-2025
type: event
version: v1
title: "London Fashion Week — Capsule for H&M Flow"
regions: [uk, eu, global]
languages: [en]
priority: 85
effective_from: 2025-02-01
expires_on: 2025-10-01
agents_consuming: [fashion, business, support, rules]
intents:
  - "london fashion week"
  - "lfw"
  - "fashion week london"
  - "what's trending in london"
  - "runway trends uk"
routing:
  default_agent: fashion
  fallbacks:
    - business   # promos, delivery windows
    - support    # orders/returns
safety:
  claims_allowlist:
    - "recycled polyester"
    - "organic cotton"
    - "RWS-certified wool"
  avoid:
    - body-shape directives
    - medical/health claims
content_source: "H&M editorial desk (demo sample)"
---

# Summary
London Fashion Week (LFW) highlights **tailored minimalism**, **statement textures**, and **late-night shimmer**. This capsule aligns live H&M inventory to runway-adjacent looks with *editorial+shoppable* guidance inside Flow Stories and PDP tips. *(Demo content for POC.)*

# Key Dates & Location
- **Dates (Feb)**: 14–18 Feb 2025 (AW showcases)  
- **City**: London, UK  
- **Best moments to feature**: eveningwear edits; elevated day tailoring; bold accessories.

# Trends to Mention (Fashion Agent)
1. **Sharp Tailoring, Soft Finish** — boxy blazers, wide-leg trousers, fluid shirts.  
2. **Metallic Night** — silver tones, liquid satin, sequins used sparingly.  
3. **Heritage Remix** — checks & houndstooth, modernized silhouettes.  
4. **Texture Play** — faux shearling, bouclé, rib knits, satin contrasts.  
5. **Muted Color Field** — charcoal, stone, midnight; **accents**: oxblood, silver.

# Editorial Angles
- “**Desk to Drinks** in 3 swaps”  
- “**One blazer, two moods**: tailoring vs. shimmer”  
- “**Softer metals**: silver as a neutral”

# Hero Looks (Shoppable)
> SKUs are placeholders for demo; map to live items at runtime.

- **Look A — Tailored Minimal**  
  - blazer: `HM-BAZ-1201`, trousers: `HM-TRW-3240`, shirt: `HM-SRT-1102`, loafers: `HM-SHO-8821`  
  - sustain_tags: [RWS-certified wool, recycled polyester]  
  - price_band: mid  
  - alt_colors: [charcoal, stone, black]

- **Look B — Metallic Night**  
  - cami: `HM-TOP-7731`, skirt satin: `HM-SKT-5520`, cardi: `HM-KNT-6642`, heels: `HM-SHO-9002`  
  - sustain_tags: [recycled polyester]  
  - price_band: accessible  
  - accent: silver

- **Look C — Heritage Remix**  
  - check coat: `HM-CT-4010`, knit: `HM-KNT-2215`, wide denim: `HM-DNM-7840`, boots: `HM-SHO-7710`  
  - sustain_tags: [organic cotton]  
  - palette: oxblood, ecru, deep navy

# Stylist Tips (Inline Snippets)
- “Let **silver** act like a neutral—pair with charcoal and stone.”  
- “Balance a **boxy blazer** with fluid trousers for LFW’s soft-tailored vibe.”  
- “Swap loafers for metallic heels after 6pm—same base, new mood.”

# Sustainability Talking Points (For Rules Agent)
- Use only allowlisted claims (above).  
- Preferred phrasing: “made with **recycled polyester**,” “contains **organic cotton**.”  
- Do **not** imply end-to-end sustainability; focus on **material content** and **care guidance**.

# Business Notes (For Business Agent)
- **Promo window**: `2025-02-10` → `2025-02-20` (POC)  
- **Shipping focus (UK)**: Next-day by 8pm cutoff; **click & collect** available.  
- **Cross-sell**: hosiery (`HM-ACC-1901`), silver belt (`HM-ACC-5122`), mini bag (`HM-BAG-3004`).

# Support Notes (For Support Agent)
- Expect questions on **returns for event outfits**; surface “unworn with tags within 30 days (region rules apply)”.  
- Provide **size & fit** exchange guidance, link to fit help.

# Surfaces & Triggers
- **Flow Story**: “London at Night” (use Look B first), CTA **Shop the look**.  
- **PDP Nudges**: show “Pair with…” from same look, prioritize **silver** accents during event dates.  
- **Search Shortcut**: typing “lfw” suggests “LFW Capsule” collection.  
- **Notification (opt-in)**: “LFW edit just dropped—silver as a neutral ✨.”

# FAQ (Short)
- **Q:** What colors are trending for LFW?  
  **A:** Charcoal, stone, midnight with **silver** as a soft accent.
- **Q:** How do I style a boxy blazer for evening?  
  **A:** Keep the base tailored and add a **metallic shoe/bag**—instant shift to night.
- **Q:** Are these items sustainable?  
  **A:** Select pieces include **recycled polyester** or **organic cotton**—see material tags on each PDP.

# Example Q→A (For Agents)
- **User:** “What should I wear to an LFW after-show?”  
  **Fashion:** “Try a satin skirt with a fine-knit cardi and **silver heels**—elevated but easy. Want a blazer to layer?”  
- **User:** “Do you deliver next day in London?”  
  **Business:** “Yes—order by **8pm** for next-day delivery in select London postcodes.”  
- **User:** “Can I return event outfits?”  
  **Support:** “Yes, unworn with tags within 30 days (UK policy). I can start a return if needed.”

# Analytics (POC)
- events: `view_event_lfw`, `tap_shop_look`, `add_bundle`, `promo_applied`  
- feature_flags: `lfw_capsule_enabled`, `silver_as_neutral_copy`

# Changelog
- v1 (2025-02-01): Initial capsule for POC; three hero looks; UK shipping note; silver accent emphasis.
