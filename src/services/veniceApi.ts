const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_VENICE_API_KEY;

export interface VeniceMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface VeniceCharacter {
  adult: boolean;
  createdAt: string;
  description: string;
  name: string;
  shareUrl: string;
  slug: string;
  stats: {
    imports: number;
  };
  tags: string[];
  updatedAt: string;
  webEnabled: boolean;
}

export interface VeniceCharactersResponse {
  data: VeniceCharacter[];
  object: string;
}

export interface VeniceApiRequest {
  messages: VeniceMessage[];
  character_slug: string;
  temperature?: number;
  max_tokens?: number;
}

export interface VeniceApiResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
}

// Response types for natural conversation flow
type ResponseType = 'reaction' | 'short' | 'medium' | 'detailed';

interface ResponseConfig {
  type: ResponseType;
  maxTokens: number;
  promptSuffix: string;
}

// Analyze last message to determine appropriate response style
const analyzeMessageContext = (lastMessage: string): ResponseType => {
  const lower = lastMessage.toLowerCase();
  
  // Questions typically deserve thoughtful responses
  if (lower.includes('?') || lower.startsWith('what') || lower.startsWith('how') || lower.startsWith('why')) {
    return Math.random() > 0.3 ? 'medium' : 'detailed';
  }
  
  // Agreement/disagreement statements often get quick reactions
  if (lower.includes('i think') || lower.includes('i believe') || lower.includes('in my opinion')) {
    return Math.random() > 0.6 ? 'reaction' : 'short';
  }
  
  // Short messages often get short responses
  if (lastMessage.length < 50) {
    return Math.random() > 0.4 ? 'reaction' : 'short';
  }
  
  // Long messages might get varied responses
  if (lastMessage.length > 200) {
    return Math.random() > 0.5 ? 'medium' : 'short';
  }
  
  // Default to varied responses
  const types: ResponseType[] = ['reaction', 'short', 'medium'];
  return types[Math.floor(Math.random() * types.length)];
};

// Dynamic response configuration based on conversation flow and context
const getResponseConfig = (messageCount: number, lastMessage?: string): ResponseConfig => {
  // Base configurations for different response types with sufficient tokens for complete responses
  const baseConfigs = {
    reaction: [
      { maxTokens: 25, promptSuffix: 'Respond with just a few words like "Yeah", "I see", "True", "Exactly", or similar natural reactions.' },
      { maxTokens: 30, promptSuffix: 'Give a brief acknowledgment or agreement/disagreement (3-6 words max).' },
      { maxTokens: 35, promptSuffix: 'React naturally with curiosity, surprise, or understanding (very brief).' }
    ],
    short: [
      { maxTokens: 60, promptSuffix: 'Give a concise but complete response (1 sentence).' },
      { maxTokens: 80, promptSuffix: 'Respond briefly but meaningfully (1-2 short sentences).' },
      { maxTokens: 70, promptSuffix: 'Keep it short and natural (1-2 sentences max).' }
    ],
    medium: [
      { maxTokens: 120, promptSuffix: 'Provide a thoughtful response (2-3 sentences).' },
      { maxTokens: 150, promptSuffix: 'Elaborate on your thoughts (2-3 sentences).' },
      { maxTokens: 130, promptSuffix: 'Give a balanced, conversational response.' }
    ],
    detailed: [
      { maxTokens: 200, promptSuffix: 'Share your perspective in detail (3-4 sentences).' },
      { maxTokens: 250, promptSuffix: 'Provide a comprehensive but conversational response.' }
    ]
  };
  
  // Determine response type based on context or fallback to pattern
  let responseType: ResponseType;
  if (lastMessage) {
    responseType = analyzeMessageContext(lastMessage);
  } else {
    // Fallback pattern that emphasizes short responses
    const pattern: ResponseType[] = ['reaction', 'short', 'reaction', 'medium', 'reaction', 'short', 'detailed', 'reaction'];
    responseType = pattern[messageCount % pattern.length];
  }
  
  // Select random config from the chosen type
  const configs = baseConfigs[responseType];
  const selectedConfig = configs[Math.floor(Math.random() * configs.length)];
  
  return {
    type: responseType,
    ...selectedConfig
  };
};

// Smart conversation memory management
const buildConversationContext = (
  messages: VeniceMessage[], 
  maxContextMessages: number = 6
): VeniceMessage[] => {
  // Keep system message + last N messages for context
  const systemMessages = messages.filter(msg => msg.role === 'system');
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  // Take the most recent messages for context
  const recentMessages = conversationMessages.slice(-maxContextMessages);
  
  return [...systemMessages, ...recentMessages];
};

export const callVeniceApi = async (
  messages: VeniceMessage[], 
  characterSlug: string, 
  messageCount: number
): Promise<string> => {
  if (!API_KEY) {
    throw new Error('Venice API key not found. Please set VITE_VENICE_API_KEY in your environment variables.');
  }

  // Validate input messages
  if (!messages || messages.length === 0) {
    throw new Error('No messages provided to Venice API');
  }

  // Optimize conversation context to manage token usage
  let optimizedMessages = buildConversationContext(messages);
  
  // Validate optimized messages
  if (!optimizedMessages || optimizedMessages.length === 0) {
    // Fallback: create a basic user message if optimization failed
    optimizedMessages = [{
      role: 'user',
      content: 'Hello, please start our conversation.'
    }];
  }
  
  // Get the last user message for analysis
  const lastMessage = optimizedMessages[optimizedMessages.length - 1];
  const lastUserMessage = optimizedMessages
    .slice()
    .reverse()
    .find(msg => msg.role === 'user')?.content || '';
  
  // Analyze message context and get response configuration
  const responseConfig = getResponseConfig(messageCount, lastUserMessage);
  
  // Build conversation summary for enhanced prompt
  const conversationHistory = optimizedMessages
    .slice(0, -1)
    .filter(msg => msg.role !== 'system')
    .map(msg => {
      const speaker = msg.role === 'user' ? 'User' : 'AI';
      return `[${speaker}: ${msg.content}]`;
    })
    .join(' ');

  // Create enhanced prompt with conversation summary
  const enhancedPrompt = conversationHistory 
    ? `${lastMessage.content} ${responseConfig.promptSuffix} As a reminder, here's what we've been talking about: ${conversationHistory}`
    : `${lastMessage.content} ${responseConfig.promptSuffix}`;

  // Create enhanced messages array
  const enhancedMessages = [...optimizedMessages];
  
  // Update the last message with enhanced prompt or add system message
  if (enhancedMessages.length > 0 && enhancedMessages[enhancedMessages.length - 1].role === 'user') {
    const lastMessage = enhancedMessages[enhancedMessages.length - 1];
    if (lastMessage) {
      lastMessage.content = enhancedPrompt;
    }
  } else {
    enhancedMessages.push({
      role: 'system',
      content: responseConfig.promptSuffix
    });
  }
  
  const requestBody = {
    model: 'venice-uncensored',
    messages: enhancedMessages,
    temperature: 0.9, // Slightly higher for more varied responses
    max_tokens: responseConfig.maxTokens,
    stream: false,
    venice_parameters: {
      character_slug: characterSlug,
      strip_thinking_response: false,
      disable_thinking: false,
      enable_web_search: 'off',
      enable_web_citations: false,
      include_search_results_in_stream: false,
      return_search_results_as_documents: true,
      include_venice_system_prompt: true
    }
  };

  try {
    console.log('Venice API Request:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(VENICE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        requestBody: requestBody
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: VeniceApiResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Venice API Error:', error);
    throw new Error('Failed to generate response from Venice API');
  }
};

// Fetch available characters from Venice API
export const fetchVeniceCharacters = async (): Promise<VeniceCharacter[]> => {
  if (!API_KEY) {
    throw new Error('Venice API key is not configured');
  }

  try {
    const response = await fetch('https://api.venice.ai/api/v1/characters', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch characters: ${response.status} ${response.statusText}`);
    }

    const data: VeniceCharactersResponse = await response.json();
    // Map webEnabled field correctly from API response
    const characters = (data.data || []).map(character => ({
      ...character,
      webEnabled: character.webEnabled || false
    }));
    return characters;
  } catch (error) {
    console.error('Failed to fetch Venice characters:', error);
    throw error;
  }
};
