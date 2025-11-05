import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assistantService } from "./services/assistant";
import { inventoryService } from "./services/inventory";
import { insertUserProfileSchema, insertAssistantEventSchema } from "@shared/schema";
import { generateImage, generateSlideshow } from "./services/mediaGeneration";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize assistant service
  await assistantService.initialize();

  // Stories
  app.get("/api/stories", async (_req, res) => {
    try {
      const stories = await storage.getAllStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      
      // Fetch full look details
      const looksWithDetails = await Promise.all(
        story.lookIds.map(async (lookId) => {
          const look = await storage.getLook(lookId);
          return look;
        })
      );
      
      res.json({ ...story, looks: looksWithDetails.filter(Boolean) });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch story" });
    }
  });

  // Collections
  app.get("/api/collections", async (_req, res) => {
    try {
      const collections = await storage.getAllCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:id", async (req, res) => {
    try {
      const collection = await storage.getCollection(req.params.id);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      
      // Fetch full item details for all items in the collection
      const itemsWithDetails = await Promise.all(
        collection.itemSkus.map(async (sku) => {
          const item = await storage.getItem(sku);
          return item;
        })
      );
      
      res.json({ ...collection, items: itemsWithDetails.filter(Boolean) });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  // Items
  app.get("/api/items", async (_req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:sku", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.sku);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      // Include stock status
      const stockStatus = await inventoryService.checkStock(req.params.sku);
      
      // If out of stock, include similar items
      const similarItems = stockStatus.status === 'out_of_stock'
        ? await inventoryService.findSimilarItems(req.params.sku)
        : [];
      
      res.json({ ...item, stockStatus, similarItems });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  // Inventory
  app.get("/api/inventory/:sku/stock", async (req, res) => {
    try {
      const stockStatus = await inventoryService.checkStock(req.params.sku);
      res.json(stockStatus);
    } catch (error) {
      res.status(500).json({ error: "Failed to check stock" });
    }
  });

  app.get("/api/inventory/:sku/similar", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const similarItems = await inventoryService.findSimilarItems(req.params.sku, limit);
      res.json({ items: similarItems });
    } catch (error) {
      res.status(500).json({ error: "Failed to find similar items" });
    }
  });

  app.post("/api/inventory/:sku/reserve", async (req, res) => {
    try {
      const { quantity = 1 } = req.body;
      const reserved = await inventoryService.reserveStock(req.params.sku, quantity);
      
      if (!reserved) {
        return res.status(409).json({ error: "Insufficient stock" });
      }
      
      res.json({ success: true, reserved: quantity });
    } catch (error) {
      res.status(500).json({ error: "Failed to reserve stock" });
    }
  });

  // Looks
  app.get("/api/looks/:id", async (req, res) => {
    try {
      const look = await storage.getLook(req.params.id);
      if (!look) {
        return res.status(404).json({ error: "Look not found" });
      }
      res.json(look);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch look" });
    }
  });

  // User Profile
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      res.json(profile || { userId: req.params.userId, sizes: [], colors: [], styleTags: [], consents: { behavioral: false, personalization: false } });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const validated = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createOrUpdateUserProfile(validated);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  app.patch("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.updateUserProfile(req.params.userId, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Assistant
  app.post("/api/assistant/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await assistantService.chat(message, context);
      
      // Log the event
      await storage.logAssistantEvent({
        agentId: response.agentId,
        agentVersion: response.agentVersion,
        context: context || '',
        userMessage: message,
        suggestion: response.message,
      });

      res.json(response);
    } catch (error) {
      console.error('Assistant chat error:', error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  app.get("/api/assistant/suggestions", async (req, res) => {
    try {
      const context = req.query.context as string || '';
      const suggestions = await assistantService.generateSuggestions(context);
      res.json({ suggestions });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });

  app.post("/api/assistant/suggestions", async (req, res) => {
    try {
      const { context } = req.body;
      const suggestions = await assistantService.generateSuggestions(context || '');
      res.json({ suggestions });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });

  app.post("/api/assistant/generate-outfit-preview", async (req, res) => {
    try {
      const { skus, modelType, items } = req.body;
      
      if (!skus || skus.length === 0) {
        return res.status(400).json({ error: "No items selected" });
      }

      // Build description of the outfit
      const outfitDescription = items.map((item: any) => 
        `${item.name} in ${item.color} (${item.material})`
      ).join(', ');

      // Map model types to descriptive body types
      const modelDescriptions: Record<string, string> = {
        athletic: 'athletic build with broad shoulders and defined muscles',
        petite: 'petite with shorter stature and slender frame',
        curvy: 'curvy with hourglass figure',
        tall: 'tall and slim build',
        plus: 'plus-size with fuller figure'
      };

      const modelDescription = modelDescriptions[modelType] || modelDescriptions.athletic;

      // Generate the image using AI
      const prompt = `High-quality fashion photography of a professional model with ${modelDescription}, wearing: ${outfitDescription}. Full body shot, studio lighting, neutral background, fashion catalog style, realistic, professional.`;

      console.log('Generating outfit preview with prompt:', prompt);

      // Use OpenAI image generation
      const response = await assistantService.generateImage(prompt);
      
      res.json({ imageUrl: response.imageUrl });
    } catch (error) {
      console.error('Outfit preview generation error:', error);
      res.status(500).json({ error: "Failed to generate outfit preview" });
    }
  });

  app.get("/api/assistant/stylist-suggestions", async (req, res) => {
    try {
      const skus = (req.query.skus as string || '').split(',').filter(Boolean);
      
      if (skus.length === 0) {
        return res.json({ suggestions: [] });
      }

      // Fetch selected items
      const items = await Promise.all(skus.map(sku => storage.getItem(sku)));
      const validItems = items.filter((item): item is NonNullable<typeof item> => item !== null && item !== undefined);

      if (validItems.length === 0) {
        return res.json({ suggestions: [] });
      }

      // Build context for AI using available item properties
      const itemDescriptions = validItems.map(item => 
        `${item.name} (${item.material}, ${item.color}, $${item.price})`
      ).join(', ');

      const context = `User is styling an outfit with: ${itemDescriptions}. Provide 2-3 specific styling tips. Format each tip as: "Main recommendation - Brief explanation." Use a dash with spaces to separate the main point from the reasoning.`;

      const response = await assistantService.chat(
        "Give me styling tips for my outfit selection",
        context
      );

      // Parse AI response into structured suggestions
      const messageLines = response.message
        .split(/\n+/)
        .filter(line => line.trim().length > 0)
        .filter(line => !line.match(/^(Here are|Here's|Based on|I'd suggest)/i));

      const suggestions = [];
      
      // Try to parse numbered suggestions (1., 2., etc.)
      const numberedPattern = /^\d+[\.)]\s*(.+)/;
      for (const line of messageLines) {
        const match = line.match(numberedPattern);
        if (match) {
          const fullText = match[1].trim();
          
          // Split only on dash/colon with surrounding whitespace to avoid breaking hyphenated words
          const separatorMatch = fullText.match(/^(.+?)\s+[-:–—]\s+(.+)$/);
          
          if (separatorMatch) {
            suggestions.push({
              text: separatorMatch[1].trim(),
              reasoning: separatorMatch[2].trim()
            });
          } else {
            // No clear separator, use full text as main suggestion
            suggestions.push({
              text: fullText,
              reasoning: `Pairs well with ${validItems[0]?.material || 'your'} pieces`
            });
          }
        }
      }

      // If no numbered suggestions found, split the message into sentences
      if (suggestions.length === 0) {
        const sentences = response.message
          .split(/(?<=[.!?])\s+/)
          .filter(s => s.trim().length > 20)
          .slice(0, 3);

        for (const sentence of sentences) {
          const cleanSentence = sentence.trim();
          suggestions.push({
            text: cleanSentence,
            reasoning: `Recommended to complement your ${validItems[0]?.material || 'selected'} items`
          });
        }
      }

      // Limit to 3 suggestions
      const finalSuggestions = suggestions.slice(0, 3);

      // If we still don't have suggestions, provide generic fallback
      if (finalSuggestions.length === 0) {
        finalSuggestions.push({
          text: "Layer your pieces for depth and versatility",
          reasoning: "Creates visual interest and adaptable styling options"
        });
      }

      res.json({ suggestions: finalSuggestions });
    } catch (error) {
      console.error('Stylist suggestions error:', error);
      res.status(500).json({ error: "Failed to generate stylist suggestions" });
    }
  });

  // Assistant events
  app.post("/api/assistant/events", async (req, res) => {
    try {
      const validated = insertAssistantEventSchema.parse(req.body);
      const event = await storage.logAssistantEvent(validated);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  // Media generation endpoints
  app.post("/api/assistant/edit-image", async (req, res) => {
    try {
      const { prompt, collectionId, userId } = req.body;
      
      if (!prompt || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Generate the edited image
      const imageUrl = await generateImage(prompt, "1024x1024");
      
      // Store the generated media in user profile
      const profile = await storage.getUserProfile(userId);
      if (profile) {
        const generatedMedia = profile.generatedMedia || [];
        generatedMedia.push({
          id: `img_${Date.now()}`,
          type: 'hero_edit',
          prompt,
          assets: [imageUrl],
          collectionId,
          createdAt: Date.now(),
        });
        
        await storage.updateUserProfile(userId, { generatedMedia });
      }
      
      res.json({ imageUrl });
    } catch (error) {
      console.error('Image edit error:', error);
      res.status(500).json({ error: "Failed to edit image" });
    }
  });

  app.post("/api/assistant/generate-slideshow", async (req, res) => {
    try {
      const { prompt, collectionId, userId, count = 3 } = req.body;
      
      if (!prompt || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get user profile for preferences
      const profile = await storage.getUserProfile(userId);
      const userPreferences = profile
        ? `${profile.previewStyle || ''} ${profile.previewMood || ''} ${profile.previewBodyDescription || ''}`.trim()
        : '';

      // Generate slideshow images
      const images = await generateSlideshow(prompt, count, userPreferences);
      
      // Store the generated media in user profile
      if (profile) {
        const generatedMedia = profile.generatedMedia || [];
        generatedMedia.push({
          id: `slideshow_${Date.now()}`,
          type: 'slideshow',
          prompt,
          assets: images,
          collectionId,
          createdAt: Date.now(),
        });
        
        await storage.updateUserProfile(userId, { generatedMedia });
      }
      
      res.json({ images });
    } catch (error) {
      console.error('Slideshow generation error:', error);
      res.status(500).json({ error: "Failed to generate slideshow" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
