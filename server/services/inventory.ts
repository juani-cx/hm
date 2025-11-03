import { storage } from "../storage";
import { type Item } from "@shared/schema";

interface SimilarItemCriteria {
  category?: string;
  color?: string;
  material?: string;
  priceRange?: { min: number; max: number };
}

class InventoryService {
  async checkStock(sku: string): Promise<{
    available: boolean;
    stock: number;
    status: 'available' | 'low_stock' | 'out_of_stock';
  }> {
    const item = await storage.getItem(sku);
    
    if (!item) {
      return { available: false, stock: 0, status: 'out_of_stock' };
    }

    const status = item.stock === 0 
      ? 'out_of_stock' 
      : item.stock < 5 
        ? 'low_stock' 
        : 'available';

    return {
      available: item.stock > 0,
      stock: item.stock,
      status
    };
  }

  async findSimilarItems(sku: string, limit: number = 3): Promise<Item[]> {
    const originalItem = await storage.getItem(sku);
    
    if (!originalItem) {
      return [];
    }

    const allItems = await storage.getAllItems();
    
    // Score each item based on similarity
    const scoredItems = allItems
      .filter(item => item.sku !== sku && item.stock > 0)
      .map(item => {
        let score = 0;
        
        // Same color
        if (item.color.toLowerCase() === originalItem.color.toLowerCase()) {
          score += 3;
        }
        
        // Same material
        if (item.material.toLowerCase() === originalItem.material.toLowerCase()) {
          score += 2;
        }
        
        // Similar price (within 30%)
        const priceDiff = Math.abs(item.price - originalItem.price);
        if (priceDiff / originalItem.price < 0.3) {
          score += 2;
        }
        
        // Has sustainability tags
        if (originalItem.sustainTags?.length && item.sustainTags?.length) {
          score += 1;
        }
        
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item }) => item);

    return scoredItems;
  }

  async updateStock(sku: string, quantity: number): Promise<void> {
    await storage.updateItemStock(sku, quantity);
  }

  async reserveStock(sku: string, quantity: number = 1): Promise<boolean> {
    const item = await storage.getItem(sku);
    
    if (!item || item.stock < quantity) {
      return false;
    }

    await storage.updateItemStock(sku, item.stock - quantity);
    return true;
  }
}

export const inventoryService = new InventoryService();
