import { z } from "zod";

// Item (product) schema
export const itemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  images: z.array(z.string()),
  price: z.number(),
  sizes: z.array(z.string()),
  color: z.string(),
  material: z.string(),
  sustainTags: z.array(z.string()).optional(),
  stock: z.number(),
  description: z.string().optional(),
  category: z.enum(['tops', 'bottoms', 'dresses', 'outerwear', 'accessories', 'shoes']).optional(),
  occasion: z.array(z.enum(['casual', 'formal', 'business', 'party', 'sport'])).optional(),
  colorFamily: z.enum(['black', 'white', 'gray', 'brown', 'beige', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'multicolor']).optional(),
});

export const insertItemSchema = itemSchema;
export type Item = z.infer<typeof itemSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;

// Look (outfit) schema
export const lookSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(z.object({
    sku: z.string(),
    name: z.string(),
    price: z.number(),
  })),
  heroImage: z.string(),
  tags: z.array(z.string()).optional(),
  sustainBadges: z.array(z.string()).optional(),
  substitutes: z.array(z.string()).optional(),
  availabilityState: z.enum(['available', 'low_stock', 'out_of_stock']).default('available'),
});

export const insertLookSchema = lookSchema.omit({ id: true });
export type Look = z.infer<typeof lookSchema>;
export type InsertLook = z.infer<typeof insertLookSchema>;

// Story schema
export const storySchema = z.object({
  id: z.string(),
  title: z.string(),
  narrativeMd: z.string().optional(),
  lookIds: z.array(z.string()),
  images: z.array(z.string()),
  femaleImages: z.array(z.string()).optional(),
  maleImages: z.array(z.string()).optional(),
  videoRef: z.string().optional(),
  campaignRef: z.string().optional(),
  tags: z.array(z.string()).optional(),
  lookCount: z.number(),
});

export const insertStorySchema = storySchema.omit({ id: true });
export type Story = z.infer<typeof storySchema>;
export type InsertStory = z.infer<typeof insertStorySchema>;

// UserProfile schema
export const userProfileSchema = z.object({
  userId: z.string(),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  priceBand: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  styleTags: z.array(z.string()).default([]),
  consents: z.object({
    behavioral: z.boolean().default(false),
    personalization: z.boolean().default(false),
  }).default({ behavioral: false, personalization: false }),
  onboardingCompleted: z.boolean().default(false),
  desiredExperience: z.enum(['ultra_personalized', 'non_intrusive', 'traditional']).optional(),
  stylePreference: z.enum(['casual_comfy', 'minimalist', 'playful', 'fashionist']).optional(),
  shoppingMood: z.enum(['magazine', 'funny_interactive', 'fashionist']).optional(),
  bodyType: z.enum(['athletic', 'petite', 'curvy', 'tall_slim', 'plus_size']).optional(),
  productPagesStyle: z.enum(['magazine', 'board', 'virtual_gallery']).optional(),
  insightsPreference: z.enum(['fashion_recommendations', 'pricing_first', 'fit_my_style']).optional(),
  previewBodyDescription: z.string().optional(),
  previewStyle: z.string().optional(),
  previewMood: z.string().optional(),
  previewInspiration: z.string().optional(),
  previewCustomPrompt: z.string().optional(),
  favoriteCollections: z.array(z.string()).default([]),
  uploadedPhotos: z.array(z.object({
    url: z.string(),
    caption: z.string().optional(),
    timestamp: z.number(),
  })).default([]),
  generatedMedia: z.array(z.object({
    id: z.string(),
    type: z.enum(['hero_edit', 'slideshow', 'video']),
    prompt: z.string(),
    assets: z.array(z.string()),
    collectionId: z.string().optional(),
    createdAt: z.number(),
  })).default([]),
  savedCollections: z.array(z.object({
    collectionId: z.string(),
    collectionTitle: z.string(),
    itemSkus: z.array(z.string()),
    savedAt: z.number(),
  })).default([]),
  aiStylistModel: z.string().default('clara-classic'),
  curatedFeed: z.boolean().default(true),
  favoriteStyles: z.array(z.string()).default([]),
  mediaPreview: z.enum(['image', 'video']).default('image'),
  topsSize: z.string().optional(),
  bottomsSize: z.string().optional(),
  fitPreference: z.number().min(0).max(100).default(50),
  gender: z.enum(['male', 'female', 'mannequin']).optional(),
});

export const insertUserProfileSchema = userProfileSchema;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// AssistantEvent schema (for logging)
export const assistantEventSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  agentId: z.string(),
  agentVersion: z.string(),
  context: z.string(),
  userMessage: z.string().optional(),
  suggestion: z.string(),
  userAction: z.enum(['view', 'click', 'dismiss']).optional(),
  contentSource: z.string().optional(),
});

export const insertAssistantEventSchema = assistantEventSchema.omit({ id: true, timestamp: true });
export type AssistantEvent = z.infer<typeof assistantEventSchema>;
export type InsertAssistantEvent = z.infer<typeof insertAssistantEventSchema>;

// Agent Registry schema
export const agentRegistrySchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['business', 'fashion', 'support', 'rules', 'regions', 'languages']),
  mdPath: z.string(),
  version: z.string(),
  lastUpdated: z.number(),
  enabled: z.boolean(),
});

export type AgentRegistry = z.infer<typeof agentRegistrySchema>;

// Collection schema
export const collectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  editorialImages: z.array(z.object({
    url: z.string(),
    caption: z.string().optional(),
    itemSkus: z.array(z.string()),
  })),
  itemSkus: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  season: z.string().optional(),
});

export const insertCollectionSchema = collectionSchema.omit({ id: true });
export type Collection = z.infer<typeof collectionSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;

// Routing Config schema
export const routingConfigSchema = z.object({
  intents: z.array(z.string()),
  agentId: z.string(),
  regions: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  fallback: z.string().optional(),
});

export type RoutingConfig = z.infer<typeof routingConfigSchema>;
