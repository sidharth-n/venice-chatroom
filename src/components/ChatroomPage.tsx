import React, { useState } from 'react';
import { ArrowLeft, Menu, X, Users, MessageSquare } from 'lucide-react';
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
  onUserMessage?: (message: string) => void;
}

const ChatroomPage: React.FC<ChatroomPageProps> = ({
  character1Name,
  character2Name,
  messages,
  isGenerating,
  currentTurn,
  onGenerateNextMessage,
  onGoBackToSetup,
  onReset,
  onUserMessage
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const firstMessage = messages.length > 0 ? messages[0].content : '';

  const handleUserSubmit = () => {
    if (userInput.trim() && onUserMessage) {
      onUserMessage(userInput.trim());
      setUserInput('');
    }
  };

  return (
    <div className="min-h-screen bg-venice-cream relative">
      {/* Fixed Header */}
      <div className="bg-venice-white shadow-sm border-b border-venice-stone border-opacity-30 sticky top-0 z-10">
        <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center text-venice-dark-olive hover:text-venice-olive-brown transition-colors p-1"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={onGoBackToSetup}
                className="flex items-center text-venice-dark-olive hover:text-venice-olive-brown transition-colors p-1"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
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
      </div>

      {/* Left Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-80 bg-venice-white shadow-xl z-50 transform transition-transform duration-300">
            <div className="p-4 border-b border-venice-stone border-opacity-30">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-venice-olive-brown">Conversation Details</h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-venice-dark-olive hover:text-venice-olive-brown transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Participants */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-4 h-4 text-venice-olive-brown" />
                  <h4 className="text-base font-medium text-venice-olive-brown">Participants</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 bg-venice-cream rounded-lg">
                    <div className="w-8 h-8 bg-venice-bright-red rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{character1Name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-venice-dark-olive">{character1Name}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-venice-cream rounded-lg">
                    <div className="w-8 h-8 bg-venice-olive-brown rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{character2Name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-venice-dark-olive">{character2Name}</span>
                  </div>
                </div>
              </div>
              
              {/* First Message */}
              {firstMessage && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-venice-olive-brown" />
                    <h4 className="text-base font-medium text-venice-olive-brown">First Message</h4>
                  </div>
                  <div className="bg-venice-beige p-3 rounded-lg border border-venice-stone border-opacity-30">
                    <p className="text-sm text-venice-dark-olive italic">"{firstMessage}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Chat Messages - Scrollable Area */}
      <MessageList
        messages={messages}
        isGenerating={isGenerating}
        currentTurn={currentTurn}
        character1Name={character1Name}
        character2Name={character2Name}
      />

      {/* Fixed Bottom Bar - WhatsApp-style */}
      <div 
        className="bg-venice-white border-t border-venice-stone border-opacity-30 p-3 sm:p-4 z-50 shadow-lg" 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 50
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-2">
            {/* Input Field */}
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && handleUserSubmit()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-venice-stone border-opacity-30 rounded-full focus:outline-none focus:ring-2 focus:ring-venice-red focus:border-transparent text-sm sm:text-base bg-venice-cream"
            />
            
            {/* Send Button */}
            {userInput.trim() ? (
              <button
                onClick={handleUserSubmit}
                className="bg-venice-bright-red text-venice-white p-3 rounded-full hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-200 flex items-center justify-center min-w-[48px] min-h-[48px]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            ) : (
              /* Next Button when no text */
              <button
                onClick={onGenerateNextMessage}
                disabled={isGenerating}
                className="bg-venice-olive-brown text-venice-white p-3 rounded-full hover:bg-venice-dark-olive active:bg-venice-dark transition-all duration-200 flex items-center justify-center min-w-[48px] min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-venice-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatroomPage;
