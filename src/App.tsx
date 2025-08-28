import React, { useState, useEffect, useRef } from 'react';
import { Users, ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: number;
  character: string;
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'setup' | 'chatroom'>('landing');
  const [character1Url, setCharacter1Url] = useState('');
  const [character2Url, setCharacter2Url] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [initialPrompt, setInitialPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Extract character names from Venice URLs
  const getCharacterName = (url: string) => {
    if (!url) return 'Character';
    const match = url.match(/\/c\/([^?]+)/);
    if (match) {
      return match[1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Character';
  };

  const character1Name = getCharacterName(character1Url);
  const character2Name = getCharacterName(character2Url);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced dummy responses for more realistic conversation
  const dummyResponses = [
    "That's a fascinating perspective. I've been contemplating this from a different angle entirely.",
    "Your point resonates with me, though I wonder if we should consider the broader implications.",
    "I find myself both agreeing and questioning that statement. Let me elaborate on why.",
    "That's an intriguing way to frame it. In my experience, I've noticed something quite different.",
    "You've touched on something important there. It reminds me of a principle I hold dear.",
    "I appreciate your insight, but I feel compelled to offer a counterpoint to that idea.",
    "Your reasoning is sound, yet I can't help but think there's more to unpack here.",
    "That observation strikes at the heart of the matter. Allow me to build upon it.",
    "I'm curious about your perspective on this. It challenges some of my core beliefs.",
    "You raise an excellent point. However, I've always approached this differently.",
  ];

  const startSetup = () => {
    setCurrentPage('setup');
  };

  const startChatroom = () => {
    if (character1Url.trim() && character2Url.trim() && initialPrompt.trim()) {
      // Add initial prompt as first message
      setMessages([{
        id: 1,
        character: 'You',
        content: initialPrompt,
        timestamp: new Date()
      }]);
      setCurrentPage('chatroom');
      setIsGenerating(false);
    }
  };

  const generateNextMessage = () => {
    setIsGenerating(true);
    
    // Simulate thinking time
    setTimeout(() => {
      const randomResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
      const currentCharacter = currentTurn === 1 ? character1Name : character2Name;
      
      const newMessage: Message = {
        id: messages.length + 1,
        character: currentCharacter,
        content: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
      setIsGenerating(false);
    }, 1500); // 1.5 second delay for thinking
  };

  const resetApp = () => {
    setCurrentPage('landing');
    setMessages([]);
    setCurrentTurn(1);
    setCharacter1Url('');
    setCharacter2Url('');
    setInitialPrompt('');
    setIsGenerating(false);
  };

  const goBackToSetup = () => {
    setCurrentPage('setup');
    setMessages([]);
    setCurrentTurn(1);
    setIsGenerating(false);
  };

  // Landing Page
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-venice-white to-venice-cream flex flex-col">
        {/* Top Header with Logo */}
        <div className="flex justify-center pt-8 sm:pt-12 pb-6 sm:pb-8">
          <div className="flex items-center justify-center">
            <img 
              src="/venice-keys-black.png" 
              alt="Venice Logo" 
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 -mt-8">
          <div className="text-center max-w-sm w-full space-y-8 sm:space-y-12">
            {/* Elegant Title */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight">
                <span className="text-venice-bright-red font-cursive">Venice</span>
                <span className="text-venice-olive-brown font-cursive ml-1 sm:ml-2">Chatroom</span>
              </h1>
              <p className="text-venice-dark-olive text-base sm:text-lg font-light leading-relaxed px-2 sm:px-4">
                Watch AI characters converse in real-time
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-6 sm:pt-8">
              <button
                onClick={startSetup}
                className="w-full bg-venice-bright-red text-venice-white py-3 sm:py-4 px-6 sm:px-8 rounded-2xl font-medium text-base sm:text-lg shadow-lg hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Chatroom
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-20"></div>
      </div>
    );
  }

  // Setup Page
  if (currentPage === 'setup') {
    return (
      <div className="min-h-screen bg-venice-cream flex flex-col">
        {/* Header */}
        <div className="bg-venice-white shadow-sm border-b border-venice-stone border-opacity-30 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('landing')}
              className="flex items-center space-x-2 text-venice-dark-olive hover:text-venice-olive-brown transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="text-lg font-semibold text-venice-olive-brown">Setup Characters</h2>
            <div className="w-12" />
          </div>
        </div>

        {/* Setup Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-venice-olive-brown mx-auto mb-3 sm:mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-venice-olive-brown mb-2">Choose Your Characters</h3>
              <p className="text-sm sm:text-base text-venice-dark-olive px-2">Enter Venice AI character URLs to start the conversation</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-venice-olive-brown mb-2">
                  Character 1 URL
                </label>
                <input
                  type="url"
                  value={character1Url}
                  onChange={(e) => setCharacter1Url(e.target.value)}
                  placeholder="https://venice.ai/c/character-name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-venice-stone border-opacity-40 rounded-xl focus:ring-2 focus:ring-venice-bright-red focus:border-transparent outline-none transition-all duration-200 bg-venice-white"
                />
                {character1Url && (
                  <p className="text-xs sm:text-sm text-venice-dark-olive mt-1">Character: {character1Name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-venice-olive-brown mb-2">
                  Character 2 URL
                </label>
                <input
                  type="url"
                  value={character2Url}
                  onChange={(e) => setCharacter2Url(e.target.value)}
                  placeholder="https://venice.ai/c/character-name"
                  className="w-full px-4 py-3 border border-venice-stone border-opacity-40 rounded-xl focus:ring-2 focus:ring-venice-bright-red focus:border-transparent outline-none transition-all duration-200 bg-venice-white"
                />
                {character2Url && (
                  <p className="text-xs sm:text-sm text-venice-dark-olive mt-1">Character: {character2Name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-venice-olive-brown mb-2">
                  Conversation Topic
                </label>
                <textarea
                  value={initialPrompt}
                  onChange={(e) => setInitialPrompt(e.target.value)}
                  placeholder="What should the characters discuss? (e.g., 'Discuss the meaning of life and happiness')"
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-venice-stone border-opacity-40 rounded-xl focus:ring-2 focus:ring-venice-bright-red focus:border-transparent outline-none transition-all duration-200 resize-none bg-venice-white"
                />
              </div>

              <button
                onClick={startChatroom}
                disabled={!character1Url.trim() || !character2Url.trim() || !initialPrompt.trim()}
                className="w-full bg-venice-bright-red text-venice-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Start Conversation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chatroom Page
  return (
    <div className="min-h-screen bg-venice-cream flex flex-col">
      {/* Fixed Header */}
      <div className="bg-venice-white shadow-sm border-b border-venice-stone border-opacity-30 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={goBackToSetup}
            className="flex items-center space-x-2 text-venice-dark-olive hover:text-venice-olive-brown transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Setup</span>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-venice-olive-brown">
              {character1Name} & {character2Name}
            </h2>
            <p className="text-xs text-venice-dark-olive">AI Conversation</p>
          </div>
          <button
            onClick={resetApp}
            className="text-sm text-venice-dark-olive hover:text-venice-olive-brown transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Chat Messages - Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24">
        <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
          {messages.map((message) => {
            // Calculate alternating sides for character messages only
            const characterMessages = messages.filter(m => m.character !== 'You');
            const characterIndex = characterMessages.findIndex(m => m.id === message.id);
            const isLeftSide = characterIndex % 2 === 0;
            
            return (
              <div key={message.id}>
                {message.character === 'You' ? (
                  // Initial prompt styling - centered
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="bg-venice-beige text-venice-olive-brown px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-venice-stone border-opacity-40 max-w-[95%] sm:max-w-[90%]">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className="text-xs font-semibold text-venice-olive-brown">Topic</span>
                        <span className="text-xs text-venice-dark-olive">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-center italic">"{message.content}"</p>
                    </div>
                  </div>
                ) : (
                  // Character messages - alternating sides
                  <div className={`flex ${isLeftSide ? 'justify-start' : 'justify-end'} mb-3 sm:mb-4`}>
                    <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
                      <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm ${
                        isLeftSide
                          ? 'bg-venice-white text-venice-olive-brown border border-venice-stone border-opacity-30 rounded-bl-md'
                          : 'bg-venice-olive-brown text-venice-white rounded-br-md'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-semibold ${
                            isLeftSide ? 'text-venice-olive-brown' : 'text-venice-cream'
                          }`}>
                            {message.character}
                          </span>
                          <span className={`text-xs ${
                            isLeftSide ? 'text-venice-dark-olive' : 'text-venice-beige'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Thinking indicator when generating */}
          {isGenerating && (
            <div className={`flex ${
              messages.filter(m => m.character !== 'You').length % 2 === 0 ? 'justify-start' : 'justify-end'
            } mb-3 sm:mb-4`}>
              <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
                <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm border ${
                  messages.filter(m => m.character !== 'You').length % 2 === 0
                    ? 'bg-venice-off-cream border-venice-stone border-opacity-30 rounded-bl-md'
                    : 'bg-venice-olive-brown bg-opacity-10 border-venice-olive-brown border-opacity-20 rounded-br-md'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-venice-olive-brown">
                      {currentTurn === 1 ? character1Name : character2Name}
                    </span>
                    <span className="text-xs text-venice-dark-olive">thinking...</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-venice-stone rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-venice-stone rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-venice-stone rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible div for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="bg-venice-white border-t border-venice-stone border-opacity-30 p-3 sm:p-4 sticky bottom-0 z-10">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={generateNextMessage}
            disabled={isGenerating}
            className="w-full bg-venice-bright-red text-venice-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-venice-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Next Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;