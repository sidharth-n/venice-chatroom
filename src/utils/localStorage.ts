import { Message } from '../types';

export interface ConversationState {
  messages: Message[];
  currentTurn: 1 | 2;
  initialPrompt: string;
  character1Url: string;
  character2Url: string;
  timestamp: number;
}

// Generate storage key from character names
export const generateStorageKey = (character1Name: string, character2Name: string): string => {
  const sanitizedName1 = character1Name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sanitizedName2 = character2Name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `venice_conversation_${sanitizedName1}_${sanitizedName2}`;
};

// Save conversation to localStorage
export const saveConversation = (
  storageKey: string,
  state: ConversationState
): void => {
  try {
    const stateWithTimestamp = {
      ...state,
      timestamp: Date.now()
    };
    localStorage.setItem(storageKey, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
};

// Load conversation from localStorage
export const loadConversation = (storageKey: string): ConversationState | null => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    
    const state = JSON.parse(saved) as ConversationState;
    
    // Convert timestamp strings back to Date objects for messages
    if (state.messages) {
      state.messages = state.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
};

// Clear specific conversation
export const clearConversation = (storageKey: string): void => {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear conversation:', error);
  }
};

// Get all saved conversations
export const getAllConversations = (): string[] => {
  try {
    const keys = Object.keys(localStorage);
    return keys.filter(key => key.startsWith('venice_conversation_'));
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return [];
  }
};

// Clean up old conversations (older than 30 days)
export const cleanupOldConversations = (): void => {
  try {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const conversationKeys = getAllConversations();
    
    conversationKeys.forEach(key => {
      const state = loadConversation(key);
      if (state && state.timestamp < thirtyDaysAgo) {
        clearConversation(key);
      }
    });
  } catch (error) {
    console.error('Failed to cleanup conversations:', error);
  }
};
