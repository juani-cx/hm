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
