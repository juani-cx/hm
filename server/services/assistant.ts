import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { type AgentRegistry, type RoutingConfig } from "@shared/schema";

// This is using Replit's AI Integrations service
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

interface AgentGuidelines {
  id: string;
  version: string;
  tone: string;
  content: string;
  objectives: string;
  examples: string;
}

class AssistantService {
  private agentRegistry: AgentRegistry[] = [];
  private routingConfig: RoutingConfig[] = [];
  private agentGuidelines: Map<string, AgentGuidelines> = new Map();

  async initialize() {
    await this.loadAgentRegistry();
    await this.loadRoutingConfig();
    await this.loadAllAgentGuidelines();
    
    console.log(`✓ Assistant initialized with ${this.agentRegistry.length} agents, ${this.agentGuidelines.size} guidelines loaded`);
  }

  private async loadAgentRegistry() {
    try {
      const registryPath = path.join(process.cwd(), 'agents', 'registry.json');
      const content = await fs.readFile(registryPath, 'utf-8');
      this.agentRegistry = JSON.parse(content);
      console.log(`Loaded ${this.agentRegistry.length} agents from registry`);
    } catch (error) {
      console.error('Failed to load agent registry:', error);
      this.agentRegistry = [];
    }
  }

  private async loadRoutingConfig() {
    try {
      const routingPath = path.join(process.cwd(), 'agents', 'routing.json');
      const content = await fs.readFile(routingPath, 'utf-8');
      this.routingConfig = JSON.parse(content);
    } catch (error) {
      console.error('Failed to load routing config:', error);
      this.routingConfig = [];
    }
  }

  private async loadAllAgentGuidelines() {
    for (const agent of this.agentRegistry) {
      if (agent.enabled) {
        await this.loadAgentGuideline(agent);
      }
    }
  }

  private async loadAgentGuideline(agent: AgentRegistry) {
    try {
      const guidelinePath = path.join(process.cwd(), agent.mdPath);
      const content = await fs.readFile(guidelinePath, 'utf-8');
      
      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      let tone = 'helpful, concise';
      
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const toneMatch = frontmatter.match(/tone:\s*"([^"]+)"/);
        if (toneMatch) {
          tone = toneMatch[1];
        }
      }

      this.agentGuidelines.set(agent.id, {
        id: agent.id,
        version: agent.version,
        tone,
        content,
        objectives: content,
        examples: content
      });
      
      console.log(`✓ Loaded guideline for ${agent.id}@${agent.version}`);
    } catch (error) {
      console.error(`✗ Failed to load guidelines for agent ${agent.id}:`, error);
    }
  }

  routeMessage(userMessage: string): { agentId: string; version: string } {
    const lowerMessage = userMessage.toLowerCase();
    
    // Find matching route based on intents
    for (const route of this.routingConfig) {
      for (const intent of route.intents) {
        if (lowerMessage.includes(intent.toLowerCase())) {
          const agent = this.agentRegistry.find(a => a.id === route.agentId && a.enabled);
          if (agent) {
            return { agentId: agent.id, version: agent.version };
          }
        }
      }
    }

    // Default to fashion agent
    const fallbackAgent = this.agentRegistry.find(a => a.id === 'fashion' && a.enabled);
    return { 
      agentId: fallbackAgent?.id || 'fashion', 
      version: fallbackAgent?.version || 'v1' 
    };
  }

  async chat(userMessage: string, context?: string): Promise<{
    message: string;
    agentId: string;
    agentVersion: string;
  }> {
    const { agentId, version } = this.routeMessage(userMessage);
    const guidelines = this.agentGuidelines.get(agentId);

    if (!guidelines) {
      return {
        message: "I'm here to help! Could you tell me more about what you're looking for?",
        agentId: 'fashion',
        agentVersion: 'v1'
      };
    }

    const systemPrompt = `You are a ${agentId} assistant for H&M Flow.

${guidelines.content}

Tone: ${guidelines.tone}

${context ? `Current context: ${context}` : ''}

IMPORTANT:
- Keep responses to 1-2 sentences maximum
- Be helpful and actionable
- Match the tone specified in the guidelines
- Reference specific items or looks when relevant`;

    try {
      console.log(`Calling OpenAI for ${agentId} with message: "${userMessage.substring(0, 50)}..."`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 512,
      });

      console.log(`OpenAI response received. Choices:`, response.choices?.length || 0);
      console.log(`First choice content:`, response.choices?.[0]?.message?.content?.substring(0, 200) || 'NULL/EMPTY');
      
      const aiMessage = response.choices[0]?.message?.content || "I'm here to help! What would you like to know?";

      return {
        message: aiMessage,
        agentId,
        agentVersion: version
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        message: "I'm having trouble right now, but I'm here to help! Could you try asking again?",
        agentId,
        agentVersion: version
      };
    }
  }

  async generateSuggestions(context: string): Promise<string[]> {
    const { agentId } = this.routeMessage(context);
    const guidelines = this.agentGuidelines.get(agentId);

    const systemPrompt = `You are a ${agentId} assistant for H&M Flow.
Generate 3 short, contextual suggestions (max 5 words each) that would help the user based on this context: ${context}

${guidelines?.content || ''}

Return only a JSON array of 3 suggestion strings, nothing else.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate suggestions" }
        ],
        max_tokens: 256,
      });

      const content = response.choices[0]?.message?.content || '[]';
      try {
        const suggestions = JSON.parse(content);
        return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
      } catch {
        return ['Show me more', 'Similar items', 'Style tips'];
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return ['Show me more', 'Similar items', 'Style tips'];
    }
  }

  async generateImage(prompt: string): Promise<{ imageUrl: string }> {
    try {
      console.log('Generating image with OpenAI image generation API');
      console.log('Prompt:', prompt.substring(0, 100) + '...');
      
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      // gpt-image-1 always returns base64 format (b64_json), not URLs
      if (!response.data || !response.data[0]?.b64_json) {
        console.error('No image data in response. Full response:', JSON.stringify(response));
        throw new Error('No image data returned from OpenAI');
      }
      
      const base64Image = response.data[0].b64_json;

      // Convert base64 to data URL format for browser display
      const imageUrl = `data:image/png;base64,${base64Image}`;
      
      console.log('Image generated successfully, base64 length:', base64Image.length);
      
      return { imageUrl };
    } catch (error) {
      console.error('Image generation error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to generate image');
    }
  }
}

export const assistantService = new AssistantService();
