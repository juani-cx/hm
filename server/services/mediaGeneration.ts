import OpenAI from "openai";
import { Buffer } from "node:buffer";

// This uses Replit's AI Integrations service for OpenAI access
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Generate a new image based on prompt
export async function generateImage(
  prompt: string,
  size: "1024x1024" | "512x512" | "256x256" = "1024x1024"
): Promise<string> {
  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
  });
  
  if (!response.data || !response.data[0]?.b64_json) {
    throw new Error("Failed to generate image");
  }
  
  const base64 = response.data[0].b64_json;
  return `data:image/png;base64,${base64}`;
}

// Generate multiple images for slideshow
export async function generateSlideshow(
  basePrompt: string,
  count: number = 3,
  userPreferences?: string
): Promise<string[]> {
  const variations = [
    `${basePrompt}, elegant and sophisticated styling`,
    `${basePrompt}, modern and minimalist aesthetic`,
    `${basePrompt}, vibrant and dynamic composition`,
    `${basePrompt}, editorial magazine photography style`,
    `${basePrompt}, artistic and creative interpretation`,
  ];
  
  const selectedPrompts = variations.slice(0, count);
  const enrichedPrompts = userPreferences
    ? selectedPrompts.map(p => `${p}, ${userPreferences}`)
    : selectedPrompts;
  
  const images = await Promise.all(
    enrichedPrompts.map(prompt => generateImage(prompt, "1024x1024"))
  );
  
  return images;
}
