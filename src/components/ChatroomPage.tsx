import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, X, Users, MessageSquare, Send, Play, Trash2, Star, Globe, Hash } from 'lucide-react';
import MessageList from './MessageList';
import { Message } from '../types';
import { VeniceCharacter } from '../services/veniceApi';
import { getSafePhotoUrl } from '../utils';

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
  character1Details?: VeniceCharacter;
  character2Details?: VeniceCharacter;
  onClearConversation?: () => void;
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
  onUserMessage,
  character1Details,
  character2Details,
  onClearConversation
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [selectedCharacterForPopup, setSelectedCharacterForPopup] = useState<VeniceCharacter | null>(null);
  const firstMessage = messages.length > 0 ? messages[0].content : '';

  const handleUserSubmit = async () => {
    if (userInput.trim() && onUserMessage) {
      const messageContent = userInput.trim();
      setUserInput('');
      onUserMessage(messageContent);
    }
  };

  const handleCharacterClick = (characterDetails: VeniceCharacter | undefined) => {
    if (characterDetails) {
      setSelectedCharacterForPopup(characterDetails);
      document.body.style.overflow = 'hidden';
    }
  };

  const closePopup = () => {
    setSelectedCharacterForPopup(null);
    document.body.style.overflow = 'unset';
  };

  // Preload character images when chatroom loads to prevent flickering
  useEffect(() => {
    const preloadImages = () => {
      const imagesToPreload = [
        character1Details?.photoUrl,
        character2Details?.photoUrl
      ].filter(Boolean);

      imagesToPreload.forEach(url => {
        if (url) {
          const img = new Image();
          img.src = getSafePhotoUrl(url) || url;
        }
      });
    };

    preloadImages();
  }, [character1Details?.photoUrl, character2Details?.photoUrl]);

  const handleClearConversation = () => {
    if (onClearConversation) {
      onClearConversation();
      setIsDrawerOpen(false);
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
                <div 
                  onClick={() => handleCharacterClick(character1Details)}
                  className="flex items-center space-x-3 p-3 bg-venice-cream rounded-lg hover:bg-venice-beige transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                    {character1Details?.photoUrl ? (
                      <img
                        src={getSafePhotoUrl(character1Details.photoUrl)}
                        alt={`${character1Name} avatar`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const parent = (e.currentTarget.parentElement as HTMLDivElement);
                          if (parent) parent.className = 'w-10 h-10 bg-venice-bright-red rounded-full flex items-center justify-center shadow-sm';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-venice-bright-red rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-medium">{character1Name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-venice-dark-olive">{character1Name}</span>
                </div>
                <div 
                  onClick={() => handleCharacterClick(character2Details)}
                  className="flex items-center space-x-3 p-3 bg-venice-cream rounded-lg hover:bg-venice-beige transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                    {character2Details?.photoUrl ? (
                      <img
                        src={getSafePhotoUrl(character2Details.photoUrl)}
                        alt={`${character2Name} avatar`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const parent = (e.currentTarget.parentElement as HTMLDivElement);
                          if (parent) parent.className = 'w-10 h-10 bg-venice-olive-brown rounded-full flex items-center justify-center shadow-sm';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-venice-olive-brown rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-medium">{character2Name.charAt(0)}</span>
                      </div>
                    )}
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

            {/* Clear Conversation Button */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Trash2 className="w-4 h-4 text-venice-olive-brown" />
                <h4 className="text-base font-medium text-venice-olive-brown">Actions</h4>
              </div>
              <button
                onClick={handleClearConversation}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-venice-bright-red hover:bg-venice-muted-red text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Clear Conversation</span>
              </button>
            </div>
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
        character1Details={character1Details}
        character2Details={character2Details}
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

      {/* Character Detail Popup */}
      {selectedCharacterForPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-hidden">
          <div className="bg-venice-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Popup Header */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-venice-stone border-opacity-20">
              <h3 className="text-lg sm:text-xl font-bold text-venice-olive-brown">Character Details</h3>
              <button
                onClick={closePopup}
                className="text-venice-dark-olive hover:text-venice-olive-brown transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Popup Content */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                {/* Character Photo */}
                <div className="w-full rounded-lg overflow-hidden border border-venice-stone border-opacity-20 bg-venice-cream">
                  {selectedCharacterForPopup.photoUrl ? (
                    <img
                      src={getSafePhotoUrl(selectedCharacterForPopup.photoUrl)}
                      alt={`${selectedCharacterForPopup.name} photo`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-56 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-venice-cream flex items-center justify-center border border-venice-stone border-opacity-30 shadow-sm">
                        <span className="font-semibold text-venice-olive-brown text-xl">
                          {selectedCharacterForPopup.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Character Name */}
                <div>
                  <h3 className="text-lg font-bold text-venice-olive-brown mb-1 leading-tight">
                    {selectedCharacterForPopup.name}
                  </h3>
                </div>

                {/* Character Stats */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2 text-sm text-venice-dark-olive">
                    <Star className="w-4 h-4 flex-shrink-0" />
                    <span>{selectedCharacterForPopup.stats.imports} imports</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-venice-dark-olive">
                    {selectedCharacterForPopup.webEnabled ? (
                      <>
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span>Web Enabled</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        <span>Chat Only</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-venice-olive-brown mb-1">Description</h4>
                  <div className="max-h-32 overflow-y-auto">
                    <p className="text-venice-dark-olive leading-relaxed text-sm">
                      {selectedCharacterForPopup.description}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-semibold text-venice-olive-brown mb-1 flex items-center">
                    <Hash className="w-4 h-4 mr-1 flex-shrink-0" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCharacterForPopup.tags.slice(0, 6).map(tag => (
                      <span
                        key={tag}
                        className="bg-venice-cream text-venice-olive-brown text-xs px-2 py-1 rounded-full border border-venice-stone border-opacity-30"
                      >
                        {tag}
                      </span>
                    ))}
                    {selectedCharacterForPopup.tags.length > 6 && (
                      <span className="text-xs text-venice-dark-olive">
                        +{selectedCharacterForPopup.tags.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatroomPage;
