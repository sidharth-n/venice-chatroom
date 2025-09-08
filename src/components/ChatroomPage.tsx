import React, { useState } from 'react';
import { ArrowLeft, Menu, X, Users, MessageSquare, Send, Play } from 'lucide-react';
import MessageList from './MessageList';
import { Message } from '../types';

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

  const handleUserSubmit = async () => {
    if (userInput.trim() && onUserMessage) {
      const messageContent = userInput.trim();
      setUserInput('');
      onUserMessage(messageContent);
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
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
            isDrawerOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsDrawerOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`fixed left-0 top-0 h-full w-80 bg-venice-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 border-b border-venice-stone border-opacity-30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-venice-olive-brown">Conversation Details</h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-venice-dark-olive hover:text-venice-olive-brown transition-colors p-1 rounded-full hover:bg-venice-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
            {/* Participants */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-4 h-4 text-venice-olive-brown" />
                <h4 className="text-base font-medium text-venice-olive-brown">Participants</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-venice-cream rounded-lg hover:bg-venice-beige transition-colors">
                  <div className="w-10 h-10 bg-venice-bright-red rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-medium">{character1Name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-venice-dark-olive">{character1Name}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-venice-cream rounded-lg hover:bg-venice-beige transition-colors">
                  <div className="w-10 h-10 bg-venice-olive-brown rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-medium">{character2Name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-venice-dark-olive">{character2Name}</span>
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
                <div className="bg-venice-beige p-4 rounded-lg border border-venice-stone border-opacity-30 shadow-sm">
                  <p className="text-sm text-venice-dark-olive italic leading-relaxed">"{firstMessage}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>

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
            <button
              onClick={handleUserSubmit}
              disabled={!userInput.trim()}
              className="bg-venice-bright-red text-venice-white p-3 rounded-full hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-200 flex items-center justify-center min-w-[48px] min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
            
            {/* Next Button - Only show after AI messages */}
            {messages.length > 1 && messages[messages.length - 1].character !== 'User' && (
              <button
                onClick={onGenerateNextMessage}
                disabled={isGenerating}
                className="bg-gradient-to-r from-venice-olive-brown to-venice-dark-olive text-venice-white p-3 rounded-full hover:from-venice-dark-olive hover:to-venice-olive-brown active:scale-95 transition-all duration-200 flex items-center justify-center min-w-[48px] min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                title="Continue conversation"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-venice-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-5 h-5" />
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
