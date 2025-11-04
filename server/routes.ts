import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { assistantService } from "./services/assistant";
import { inventoryService } from "./services/inventory";
import { insertUserProfileSchema, insertAssistantEventSchema } from "@shared/schema";

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

  app.get("/api/assistant/stylist-suggestions", async (req, res) => {
    try {
      const skus = (req.query.skus as string || '').split(',').filter(Boolean);
      
      if (skus.length === 0) {
        return res.json({ suggestions: [] });
      }

      // Fetch selected items
      const items = await Promise.all(skus.map(sku => storage.getItem(sku)));
      const validItems = items.filter(Boolean);

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

  const httpServer = createServer(app);

  return httpServer;
}
