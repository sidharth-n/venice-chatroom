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
    <div className="min-h-screen bg-venice-cream flex flex-col relative">
      {/* Fixed Header */}
      <div className="bg-venice-white shadow-sm border-b border-venice-stone border-opacity-30 p-2 sm:p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onGoBackToSetup}
            className="flex items-center text-venice-dark-olive hover:text-venice-olive-brown transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="text-center flex-1 mx-2">
            <h2 className="text-lg sm:text-2xl font-semibold text-venice-olive-brown leading-tight">
              {character1Name} & {character2Name}
            </h2>
            <p className="text-xs sm:text-base text-venice-dark-olive">AI Conversation</p>
          </div>
          <button
            onClick={onReset}
            className="text-sm sm:text-lg text-venice-dark-olive hover:text-venice-olive-brown transition-colors p-1"
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

      {/* Fixed Bottom Bar - Enhanced for mobile visibility */}
      <div className="bg-venice-white border-t border-venice-stone border-opacity-30 p-3 sm:p-4 sticky bottom-0 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onGenerateNextMessage}
            disabled={isGenerating}
            className="w-full bg-venice-bright-red text-venice-white py-3 sm:py-3.5 px-4 sm:px-5 rounded-lg font-medium text-base sm:text-lg shadow-lg hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[52px]"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-venice-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold">Generating...</span>
              </>
            ) : (
              <span className="font-semibold">{messages.length === 1 ? 'Start Conversation' : 'Next Message'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatroomPage;
