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
  }

  private async loadAgentRegistry() {
    try {
      const registryPath = path.join(process.cwd(), 'agents', 'registry.json');
      const content = await fs.readFile(registryPath, 'utf-8');
      this.agentRegistry = JSON.parse(content);
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
    } catch (error) {
      console.error(`Failed to load guidelines for agent ${agent.id}:`, error);
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
      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_completion_tokens: 512,
      });

      return {
        message: response.choices[0]?.message?.content || "I'm here to help! What would you like to know?",
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
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate suggestions" }
        ],
        max_completion_tokens: 256,
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
}

export const assistantService = new AssistantService();
