export interface Message {
  id: number;
  character: string;
  content: string;
  timestamp: Date;
}

export type PageType = 'landing' | 'setup' | 'chatroom';

export interface AppState {
  currentPage: PageType;
  character1Url: string;
  character2Url: string;
  messages: Message[];
  currentTurn: 1 | 2;
  initialPrompt: string;
  isGenerating: boolean;
}
