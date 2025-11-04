import {
  type Item,
  type InsertItem,
  type Look,
  type InsertLook,
  type Story,
  type InsertStory,
  type Collection,
  type InsertCollection,
  type UserProfile,
  type InsertUserProfile,
  type AssistantEvent,
  type InsertAssistantEvent,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Items
  getItem(sku: string): Promise<Item | undefined>;
  getAllItems(): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItemStock(sku: string, stock: number): Promise<Item | undefined>;
  
  // Looks
  getLook(id: string): Promise<Look | undefined>;
  getAllLooks(): Promise<Look[]>;
  createLook(look: InsertLook): Promise<Look>;
  
  // Stories
  getStory(id: string): Promise<Story | undefined>;
  getAllStories(): Promise<Story[]>;
  createStory(story: InsertStory): Promise<Story>;
  
  // Collections
  getCollection(id: string): Promise<Collection | undefined>;
  getAllCollections(): Promise<Collection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  
  // UserProfile
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createOrUpdateUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  
  // AssistantEvents (logging)
  logAssistantEvent(event: InsertAssistantEvent): Promise<AssistantEvent>;
  getAssistantEvents(limit?: number): Promise<AssistantEvent[]>;
}

export class MemStorage implements IStorage {
  private items: Map<string, Item>;
  private looks: Map<string, Look>;
  private stories: Map<string, Story>;
  private collections: Map<string, Collection>;
  private userProfiles: Map<string, UserProfile>;
  private assistantEvents: AssistantEvent[];

  constructor() {
    this.items = new Map();
    this.looks = new Map();
    this.stories = new Map();
    this.collections = new Map();
    this.userProfiles = new Map();
    this.assistantEvents = [];
  }

  // Items
  async getItem(sku: string): Promise<Item | undefined> {
    return this.items.get(sku);
  }

  async getAllItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async createItem(item: InsertItem): Promise<Item> {
    this.items.set(item.sku, item);
    return item;
  }

  async updateItemStock(sku: string, stock: number): Promise<Item | undefined> {
    const item = this.items.get(sku);
    if (item) {
      item.stock = stock;
      this.items.set(sku, item);
    }
    return item;
  }

  // Looks
  async getLook(id: string): Promise<Look | undefined> {
    return this.looks.get(id);
  }

  async getAllLooks(): Promise<Look[]> {
    return Array.from(this.looks.values());
  }

  async createLook(insertLook: InsertLook): Promise<Look> {
    const id = randomUUID();
    const look: Look = { ...insertLook, id };
    this.looks.set(id, look);
    return look;
  }

  // Stories
  async getStory(id: string): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getAllStories(): Promise<Story[]> {
    return Array.from(this.stories.values());
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = randomUUID();
    const story: Story = { ...insertStory, id };
    this.stories.set(id, story);
    return story;
  }

  // Collections
  async getCollection(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async getAllCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const collection: Collection = { ...insertCollection, id };
    this.collections.set(id, collection);
    return collection;
  }

  // UserProfile
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(userId);
  }

  async createOrUpdateUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    this.userProfiles.set(profile.userId, profile);
    return profile;
  }

  // AssistantEvents
  async logAssistantEvent(insertEvent: InsertAssistantEvent): Promise<AssistantEvent> {
    const event: AssistantEvent = {
      id: randomUUID(),
      timestamp: Date.now(),
      ...insertEvent,
    };
    this.assistantEvents.push(event);
    return event;
  }

  async getAssistantEvents(limit: number = 100): Promise<AssistantEvent[]> {
    return this.assistantEvents.slice(-limit);
  }
}

export const storage = new MemStorage();
