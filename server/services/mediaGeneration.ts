import OpenAI from "openai";
import { Buffer } from "node:buffer";

// Using user's own OpenAI API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_LUCAS
});

// Generate a new image based on prompt
export async function generateImage(
  prompt: string,
  size: "1024x1024" | "512x512" | "256x256" = "1024x1024",
  isMannequin: boolean = false
): Promise<string> {
  let enhancedPrompt: string;
  
  if (isMannequin) {
    // For mannequins, use product photography enhancement
    enhancedPrompt = `${prompt}, professional product photography, high-end retail display, sharp detail, commercial quality, 8k resolution, studio setup`;
  } else {
    // For human models, emphasize realistic appearance
    enhancedPrompt = `Authentic fashion photography of a real person, natural human features, realistic skin texture with pores and subtle imperfections, genuine human expression, ${prompt}, professional but natural lighting, true-to-life appearance, real human model (not CGI, not digital art, not plastic-looking), natural beauty, soft studio lighting with realistic shadows, genuine photograph, authentic human subject, high quality DSLR camera photography`;
  }
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    size,
    quality: "hd",
  });
  
  if (!response.data || !response.data[0]?.url) {
    throw new Error("Failed to generate image");
  }
  
  const imageUrl = response.data[0].url;
  return imageUrl;
}

// Generate multiple images for slideshow
export async function generateSlideshow(
  basePrompt: string,
  count: number = 3,
  userPreferences?: string,
  isMannequin: boolean = false
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
    enrichedPrompts.map(prompt => generateImage(prompt, "1024x1024", isMannequin))
  );
  
  return images;
}
