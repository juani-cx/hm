import { storage } from "./storage";
import { type InsertItem, type InsertLook, type InsertStory } from "@shared/schema";

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
      narrativeMd: "Discover the perfect layering pieces for fall",
      lookIds: [lookIds[0]],
      images: ["/generated_images/Story_card_autumn_look_7a4bbbf6.png", "/generated_images/Story_card_workwear_look_a3ea8ce1.png"],
      tags: ["Sustainability", "Fall"],
      lookCount: 2
    },
    {
      title: "Summer Breeze",
      narrativeMd: "Light and airy pieces for warm weather",
      lookIds: [lookIds[1]],
      images: ["/generated_images/Story_card_summer_look_b5f6c911.png"],
      tags: ["Fresh", "Summer"],
      lookCount: 1
    },
  ];

  for (const story of stories) {
    await storage.createStory(story);
  }

  console.log('✅ Seed data loaded successfully');
}
