const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_VENICE_API_KEY;

export interface VeniceMessage {
  content: string;
  role: 'user' | 'assistant' | 'system';
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

// Dynamic message length based on conversation flow
const getMessageLength = (messageCount: number): number => {
  const lengths = [80, 120, 150, 100, 180, 90, 140, 110, 160, 130]; // Varied lengths
  return lengths[messageCount % lengths.length];
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
  messageCount: number = 0
): Promise<string> => {
  // Optimize context to prevent token overflow and reduce costs
  const optimizedMessages = buildConversationContext(messages);
  
  // Dynamic message length for human-like variety
  const dynamicMaxTokens = getMessageLength(messageCount);
  
  const requestBody = {
    model: 'venice-uncensored',
    messages: optimizedMessages,
    temperature: 0.8,
    max_tokens: dynamicMaxTokens,
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
    const response = await fetch(VENICE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: VeniceApiResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Venice API Error:', error);
    throw new Error('Failed to get response from Venice AI');
  }
};
