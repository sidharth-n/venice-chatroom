import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Message } from '../types';
import MessageList from './MessageList';

interface ChatroomPageProps {
  character1Name: string;
  character2Name: string;
  messages: Message[];
  isGenerating: boolean;
  currentTurn: 1 | 2;
  onGenerateNextMessage: () => void;
  onGoBackToSetup: () => void;
  onReset: () => void;
}

const ChatroomPage: React.FC<ChatroomPageProps> = ({
  character1Name,
  character2Name,
  messages,
  isGenerating,
  currentTurn,
  onGenerateNextMessage,
  onGoBackToSetup,
  onReset
}) => {
  return (
    <div className="min-h-screen bg-venice-cream flex flex-col">
      {/* Fixed Header */}
      <div className="bg-venice-white shadow-sm border-b border-venice-stone border-opacity-30 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onGoBackToSetup}
            className="flex items-center text-venice-dark-olive hover:text-venice-olive-brown transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-venice-olive-brown">
              {character1Name} & {character2Name}
            </h2>
            <p className="text-xs text-venice-dark-olive">AI Conversation</p>
          </div>
          <button
            onClick={onReset}
            className="text-sm text-venice-dark-olive hover:text-venice-olive-brown transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Chat Messages - Scrollable Area */}
      <MessageList
        messages={messages}
        isGenerating={isGenerating}
        currentTurn={currentTurn}
        character1Name={character1Name}
        character2Name={character2Name}
      />

      {/* Fixed Bottom Bar */}
      <div className="bg-venice-white border-t border-venice-stone border-opacity-30 p-3 sm:p-4 sticky bottom-0 z-10">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onGenerateNextMessage}
            disabled={isGenerating}
            className="w-full bg-venice-bright-red text-venice-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-venice-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <span>{messages.length === 1 ? 'Start Conversation' : 'Next Message'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatroomPage;
