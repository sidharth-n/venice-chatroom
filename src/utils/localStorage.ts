import { Message } from '../types';
import { VeniceCharacter } from '../services/veniceApi';

export interface ConversationState {
  messages: Message[];
  currentTurn: 1 | 2;
  initialPrompt: string;
  character1Url: string;
  character2Url: string;
  timestamp: number;
}

// Generate storage key from character names and initial prompt
export const generateStorageKey = (character1Name: string, character2Name: string, initialPrompt?: string): string => {
  const sanitizedName1 = character1Name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedName2 = character2Name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (initialPrompt) {
    // Create a hash of the initial prompt to make it unique per topic
    const promptHash = initialPrompt.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    return `venice_conversation_${sanitizedName1}_${sanitizedName2}_${promptHash}`;
  }
  
  return `venice_conversation_${sanitizedName1}_${sanitizedName2}`;
};

// Save conversation to localStorage
export const saveConversation = (characterNames: string, conversation: ConversationState) => {
  try {
    const key = `venice-conversation-${characterNames}`;
    const data = {
      ...conversation,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
};

export const loadConversation = (characterNames: string): ConversationState | null => {
  try {
    const key = `venice-conversation-${characterNames}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // Check if conversation is older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (parsed.timestamp < thirtyDaysAgo) {
      localStorage.removeItem(key);
      return null;
    }
    
    return {
      messages: parsed.messages || [],
      currentTurn: parsed.currentTurn || 1,
      initialPrompt: parsed.initialPrompt || '',
      character1Url: parsed.character1Url || '',
      character2Url: parsed.character2Url || '',
      timestamp: parsed.timestamp
    };
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
};

export const clearConversation = (characterNames: string) => {
  try {
    const key = `venice-conversation-${characterNames}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear conversation:', error);
  }
};

export const clearAllConversations = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('venice-conversation-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all conversations:', error);
  }
};

// Character caching functions
export const saveCharacters = (characters: VeniceCharacter[]) => {
  try {
    const data = {
      characters,
      timestamp: Date.now()
    };
    localStorage.setItem('venice-characters', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save characters:', error);
  }
};

export const loadCharacters = (): VeniceCharacter[] | null => {
  try {
    const data = localStorage.getItem('venice-characters');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // Check if characters are older than 24 hours
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (parsed.timestamp < twentyFourHoursAgo) {
      localStorage.removeItem('venice-characters');
      return null;
    }
    
    return parsed.characters || null;
  } catch (error) {
    console.error('Failed to load characters:', error);
    return null;
  }
};

export const clearCharacters = () => {
  try {
    localStorage.removeItem('venice-characters');
  } catch (error) {
    console.error('Failed to clear characters:', error);
  }
};

// Clean up old conversations (older than 30 days)
export const cleanupOldConversations = (): void => {
  try {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const keys = Object.keys(localStorage);
    
    keys.forEach((key: string) => {
      if (key.startsWith('venice-conversation-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.timestamp < thirtyDaysAgo) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to cleanup old conversations:', error);
  }
};
