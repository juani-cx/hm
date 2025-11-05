import { storage } from "./storage";
import { type InsertItem, type InsertLook, type InsertStory, type InsertCollection } from "@shared/schema";

export async function seedData() {
  // Seed Items
  const items: InsertItem[] = [
    {
      sku: "SKU001",
      name: "Premium Leather Jacket",
      images: ["/generated_images/Product_leather_jacket_a13fb76c.png"],
      price: 199,
      sizes: ["XS", "S", "M", "L", "XL"],
      color: "Black",
      material: "Genuine Leather",
      sustainTags: ["Eco-friendly tanning", "Recycled lining"],
      stock: 12,
      description: "Classic leather jacket with a modern twist."
    },
    {
      sku: "SKU002",
      name: "White Turtleneck",
      images: ["/generated_images/Product_basic_tee_7cb6d64a.png"],
      price: 29,
      sizes: ["XS", "S", "M", "L", "XL"],
      color: "White",
      material: "Organic Cotton",
      sustainTags: ["100% Organic Cotton"],
      stock: 45,
      description: "Essential white turtleneck for layering."
    },
    {
      sku: "SKU003",
      name: "Wool Scarf",
      images: ["/generated_images/Product_knit_sweater_77d57eeb.png"],
      price: 35,
      sizes: ["One Size"],
      color: "Beige",
      material: "Merino Wool",
      sustainTags: ["Responsible Wool"],
      stock: 28,
      description: "Soft merino wool scarf for cold days."
    },
    {
      sku: "SKU004",
      name: "Knit Sweater",
      images: ["/generated_images/Product_knit_sweater_77d57eeb.png"],
      price: 49,
      sizes: ["XS", "S", "M", "L", "XL"],
      color: "Beige",
      material: "Cotton Blend",
      sustainTags: [],
      stock: 30,
      description: "Cozy knit sweater perfect for weekends."
    },
    {
      sku: "SKU005",
      name: "Denim Jeans",
      images: ["/generated_images/Product_denim_jeans_ce699130.png"],
      price: 59,
      sizes: ["26", "28", "30", "32", "34"],
      color: "Blue",
      material: "Denim",
      sustainTags: ["Water-saving production"],
      stock: 50,
      description: "Classic blue denim with modern fit."
    },
    {
      sku: "SKU006",
      name: "Floral Midi Dress",
      images: ["/generated_images/Product_knit_sweater_77d57eeb.png"],
      price: 79,
      sizes: ["XS", "S", "M", "L", "XL"],
      color: "Multicolor",
      material: "Recycled Polyester",
      sustainTags: ["Made from recycled materials"],
      stock: 22,
      description: "Elegant floral dress perfect for any occasion."
    },
    {
      sku: "SKU007",
      name: "Tailored Blazer",
      images: ["/generated_images/Product_leather_jacket_a13fb76c.png"],
      price: 129,
      sizes: ["XS", "S", "M", "L", "XL"],
      color: "Navy",
      material: "Wool Blend",
      sustainTags: ["Responsible Wool"],
      stock: 18,
      description: "Professional blazer with modern fit."
    },
    {
      sku: "SKU008",
      name: "Silk Blouse",
      images: ["/generated_images/Product_basic_tee_7cb6d64a.png"],
      price: 69,
      sizes: ["XS", "S", "M", "L", "XL"],
      color: "Cream",
      material: "Silk",
      sustainTags: [],
      stock: 25,
      description: "Luxurious silk blouse for elegant looks."
    },
    {
      sku: "SKU009",
      name: "Wide-Leg Trousers",
      images: ["/generated_images/Product_denim_jeans_ce699130.png"],
      price: 69,
      sizes: ["XS", "S", "M", "L", "XL"],
      color: "Black",
      material: "Cotton Blend",
      sustainTags: ["Water-saving production"],
      stock: 30,
      description: "Sophisticated wide-leg trousers."
    },
  ];

  for (const item of items) {
    await storage.createItem(item);
  }

  // Seed Looks
  const looks: InsertLook[] = [
    {
      title: "Autumn Layers",
      items: [
        { sku: "SKU001", name: "Premium Leather Jacket", price: 199 },
        { sku: "SKU002", name: "White Turtleneck", price: 29 },
        { sku: "SKU003", name: "Wool Scarf", price: 35 },
      ],
      heroImage: "/generated_images/Story_card_autumn_look_7a4bbbf6.png",
      tags: ["Sustainability", "Layering"],
      sustainBadges: ["Eco-friendly materials"],
      substitutes: [],
      availabilityState: "available"
    },
    {
      title: "Cozy Weekend",
      items: [
        { sku: "SKU004", name: "Knit Sweater", price: 49 },
        { sku: "SKU005", name: "Denim Jeans", price: 59 },
      ],
      heroImage: "/generated_images/Story_card_workwear_look_a3ea8ce1.png",
      tags: ["Casual", "Comfort"],
      sustainBadges: [],
      substitutes: [],
      availabilityState: "available"
    },
    {
      title: "Spring Garden",
      items: [
        { sku: "SKU006", name: "Floral Midi Dress", price: 79 },
      ],
      heroImage: "/generated_images/Story_card_summer_look_b5f6c911.png",
      tags: ["Floral", "Spring"],
      sustainBadges: ["Made from recycled materials"],
      substitutes: [],
      availabilityState: "available"
    },
    {
      title: "Office Chic",
      items: [
        { sku: "SKU007", name: "Tailored Blazer", price: 129 },
        { sku: "SKU008", name: "Silk Blouse", price: 69 },
        { sku: "SKU009", name: "Wide-Leg Trousers", price: 69 },
      ],
      heroImage: "/generated_images/Story_card_workwear_look_a3ea8ce1.png",
      tags: ["Professional", "Elegant"],
      sustainBadges: ["Responsible Wool"],
      substitutes: [],
      availabilityState: "available"
    },
  ];

  const lookIds: string[] = [];
  for (const look of looks) {
    const created = await storage.createLook(look);
    lookIds.push(created.id);
  }

  // Seed Stories
  const stories: InsertStory[] = [
    {
      title: "Autumn Essentials",
      narrativeMd: `As the leaves begin their chromatic transformation and the air takes on that unmistakable crispness, there's an inherent shift in our relationship with fashion. This season, we're celebrating the art of layering—not merely as a practical necessity, but as an opportunity for self-expression and sustainable style.

Our Autumn Essentials collection embodies this philosophy, bringing together pieces that transcend fleeting trends to become true wardrobe investments. At the heart of this narrative stands our Premium Leather Jacket, crafted from ethically sourced leather with eco-friendly tanning processes. It's more than outerwear; it's a statement of conscious luxury that improves with age, developing a unique patina that tells your story.

Beneath, the foundation of any autumn wardrobe: our White Turtleneck in 100% organic cotton. Its minimalist elegance provides the perfect canvas for layering, offering versatility that extends from weekend market runs to sophisticated evening gatherings. Pair it with our responsibly sourced Merino Wool Scarf, and you've created a trifecta of timeless style and environmental consciousness.

This collection represents more than clothing—it's an invitation to embrace the season with intention, choosing pieces that honor both craft and planet. Each item has been selected to complement the others, creating endless possibilities for personal expression while minimizing environmental impact.`,
      lookIds: [lookIds[0]],
      images: ["/generated_images/Story_card_autumn_look_7a4bbbf6.png", "/generated_images/Story_card_workwear_look_a3ea8ce1.png"],
      tags: ["Sustainability", "Fall"],
      lookCount: 2
    },
    {
      title: "Summer Breeze",
      narrativeMd: `Summer dressing should feel effortless—a second skin that moves with you through sun-drenched days and balmy evenings. Our Summer Breeze collection captures this essence, offering pieces that prioritize both comfort and conscious design.

There's a particular freedom in summer style that we've channeled into this curated selection. The Knit Sweater in our signature beige becomes your companion for those cooler coastal evenings, while our water-conscious Denim Jeans provide the perfect foundation for endless summer adventures. These aren't just clothes; they're enablers of experience, designed to support your most authentic summer self.

We've reimagined casual wear through the lens of sustainability, proving that environmental responsibility and effortless style are not mutually exclusive. Each piece in this collection has been chosen for its ability to transition seamlessly from beach gatherings to sunset dinners, embodying the relaxed sophistication that defines the season.

This is summer dressing at its finest—uncomplicated, authentic, and aligned with your values. It's about creating space for life's moments while treading lightly on the earth.`,
      lookIds: [lookIds[1]],
      images: ["/generated_images/Story_card_summer_look_b5f6c911.png"],
      tags: ["Fresh", "Summer"],
      lookCount: 1
    },
    {
      title: "Spring Garden",
      narrativeMd: `Spring arrives not with fanfare but with whispers—the first bloom, the subtle shift in light, the gentle warming of the earth. Our Spring Garden collection embodies this delicate awakening, celebrating renewal through sustainable craftsmanship and botanical inspiration.

The Floral Midi Dress stands as the centerpiece of this narrative, crafted entirely from recycled polyester yet retaining all the fluid grace of traditional fabrics. Its vibrant botanical print captures the essence of a garden in full bloom, while its thoughtful construction speaks to our commitment to circular fashion. This is conscious design at its most elegant—proving that sustainability can be beautiful, feminine, and utterly covetable.

This season, we invite you to embrace a slower, more intentional approach to dressing. Each piece has been designed to transcend seasonal boundaries, becoming a cherished part of your wardrobe for years to come. The floral motifs aren't merely decorative—they're a celebration of nature's resilience and beauty, a reminder to honor the world that inspires us.

Spring Garden represents fashion's future: thoughtful, sustainable, and deeply connected to the natural world. It's an invitation to bloom alongside the season, expressing your most vibrant self while nurturing the planet.`,
      lookIds: [lookIds[2]],
      images: ["/generated_images/Story_card_summer_look_b5f6c911.png"],
      tags: ["Floral", "Sustainable"],
      lookCount: 1
    },
    {
      title: "Workwear Edit",
      narrativeMd: `Modern professional dressing demands more than just polish—it requires pieces that empower, inspire confidence, and reflect your personal narrative while commanding respect in any room you enter. Our Workwear Edit collection redefines power dressing for the contemporary professional.

At its foundation lies the Tailored Blazer, constructed from responsibly sourced wool blend with a cut that flatters while allowing freedom of movement. This isn't your mother's boardroom attire; it's been reimagined for the woman who leads meetings, closes deals, and mentors the next generation—all before lunch. Paired with our luxurious Silk Blouse in cream, it creates a harmony of structure and softness that speaks to the multifaceted nature of modern professionalism.

The Wide-Leg Trousers complete this triumvirate, offering a sophisticated silhouette that bridges boardroom formality with creative sector cool. Crafted using water-saving production methods, they prove that professional excellence and environmental consciousness can coexist beautifully.

This collection celebrates the evolution of workwear, honoring tradition while pushing boundaries. These are investment pieces designed to support your ambitions, crafted with attention to detail that speaks to your own commitment to excellence. Because true professional power comes not from conformity, but from authentic self-expression grounded in quality and values.`,
      lookIds: [lookIds[3]],
      images: ["/generated_images/Story_card_workwear_look_a3ea8ce1.png"],
      tags: ["Professional", "Tailored"],
      lookCount: 1
    },
  ];

  for (const story of stories) {
    await storage.createStory(story);
  }

  // Seed Collections
  const collections: InsertCollection[] = [
    {
      title: "Autumn Essentials",
      description: "Discover the perfect pieces for fall layering. From premium leather to cozy knits, this collection brings together timeless staples that transition seamlessly from crisp morning walks to evening gatherings.",
      editorialImages: [
        {
          url: "/generated_images/Story_card_autumn_look_7a4bbbf6.png",
          caption: "Autumn Layers",
          itemSkus: ["SKU001", "SKU002", "SKU003"],
        },
        {
          url: "/generated_images/Story_card_workwear_look_a3ea8ce1.png",
          caption: "Cozy Weekend",
          itemSkus: ["SKU004", "SKU005"],
        },
      ],
      itemSkus: ["SKU001", "SKU002", "SKU003", "SKU004", "SKU005"],
      tags: ["Sustainability", "Layering", "Fall"],
      season: "Fall/Winter 2025",
    },
    {
      title: "Spring Awakening",
      description: "Embrace the season of renewal with flowing silhouettes and vibrant florals. Each piece in this collection celebrates sustainable craftsmanship and effortless elegance.",
      editorialImages: [
        {
          url: "/generated_images/Story_card_summer_look_b5f6c911.png",
          caption: "Garden Party",
          itemSkus: ["SKU006"],
        },
      ],
      itemSkus: ["SKU006"],
      tags: ["Floral", "Sustainable", "Spring"],
      season: "Spring/Summer 2025",
    },
    {
      title: "Workwear Edit",
      description: "Professional pieces that command attention. This curated selection brings together tailored excellence and timeless sophistication for the modern professional.",
      editorialImages: [
        {
          url: "/generated_images/Story_card_workwear_look_a3ea8ce1.png",
          caption: "Office Chic",
          itemSkus: ["SKU007", "SKU008", "SKU009"],
        },
      ],
      itemSkus: ["SKU007", "SKU008", "SKU009"],
      tags: ["Professional", "Tailored", "Elegant"],
      season: "Year-Round",
    },
  ];

  for (const collection of collections) {
    await storage.createCollection(collection);
  }

  console.log('✅ Seed data loaded successfully');
}
