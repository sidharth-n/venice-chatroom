import React, { useState, useEffect } from 'react';
import { PageType, Message } from './types';
import { getCharacterName, getCharacterSlug } from './utils';
import { callVeniceApi, VeniceMessage, VeniceCharacter } from './services/veniceApi';
import { 
  generateStorageKey, 
  saveConversation, 
  loadConversation, 
  clearConversation,
  cleanupOldConversations 
} from './utils/localStorage';
import LandingPage from './components/LandingPage';
import SetupPage from './components/SetupPage';
import ChatroomPage from './components/ChatroomPage';
import CharacterSelector from './components/CharacterSelector';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [character1Url, setCharacter1Url] = useState('');
  const [character2Url, setCharacter2Url] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [characterSelectorTarget, setCharacterSelectorTarget] = useState<1 | 2>(1);
  const [selectedCharacters, setSelectedCharacters] = useState<VeniceCharacter[]>([]);

  const character1Name = getCharacterName(character1Url);
  const character2Name = getCharacterName(character2Url);
  
  // Generate storage key for current conversation
  const storageKey = character1Name && character2Name 
    ? generateStorageKey(character1Name, character2Name)
    : '';

  // Load conversation on component mount and cleanup old conversations
  useEffect(() => {
    cleanupOldConversations();
  }, []);

  // Load saved conversation when both characters are set
  useEffect(() => {
    if (storageKey && currentPage === 'chatroom') {
      const savedConversation = loadConversation(storageKey);
      if (savedConversation) {
        setMessages(savedConversation.messages);
        setCurrentTurn(savedConversation.currentTurn);
      }
    }
  }, [storageKey, currentPage]);

  // Save conversation whenever messages change
  useEffect(() => {
    if (storageKey && messages.length > 0) {
      const conversationState = {
        messages,
        currentTurn,
        initialPrompt,
        character1Url,
        character2Url,
        timestamp: Date.now()
      };
      saveConversation(storageKey, conversationState);
    }
  }, [messages, currentTurn, storageKey, initialPrompt, character1Url, character2Url]);

  const startSetup = () => {
    setCurrentPage('setup');
  };

  const startChatroom = () => {
    if (character1Url.trim() && character2Url.trim() && initialPrompt.trim()) {
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

  const generateNextMessage = async () => {
    setIsGenerating(true);
    
    try {
      const currentCharacterUrl = currentTurn === 1 ? character1Url : character2Url;
      const currentCharacterSlug = getCharacterSlug(currentCharacterUrl);
      const currentCharacter = currentTurn === 1 ? character1Name : character2Name;
      
      // Build conversation history for API
      const conversationHistory: VeniceMessage[] = [];
      
      // Add initial topic as system message
      if (messages.length > 0) {
        conversationHistory.push({
          role: 'system',
          content: `You are engaging in a conversation about: "${messages[0].content}". Please respond naturally and stay in character.`
        });
      }
      
      // Add previous messages as conversation context
      messages.slice(1).forEach(msg => {
        if (msg.character !== 'You') {
          conversationHistory.push({
            role: msg.character === currentCharacter ? 'assistant' : 'user',
            content: msg.content
          });
        }
      });
      
      // If this is the first message, ask the character to start the discussion
      if (messages.length === 1) {
        conversationHistory.push({
          role: 'user',
          content: `Please start a thoughtful discussion about this topic. Share your perspective and invite further conversation.`
        });
      }
      
      const response = await callVeniceApi(conversationHistory, currentCharacterSlug, messages.length);
      
      const newMessage: Message = {
        id: messages.length + 1,
        character: currentCharacter,
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
    } catch (error) {
      console.error('Failed to generate message:', error);
      // Fallback to a generic error message
      const newMessage: Message = {
        id: messages.length + 1,
        character: currentTurn === 1 ? character1Name : character2Name,
        content: "I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    // Clear saved conversation from localStorage
    if (storageKey) {
      clearConversation(storageKey);
    }
    
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
  };

  const openCharacterSelector = (target: 1 | 2) => {
    setCharacterSelectorTarget(target);
    setCurrentPage('character-selector');
  };

  const handleCharacterSelect = (character: VeniceCharacter) => {
    if (characterSelectorTarget === 1) {
      setCharacter1Url(character.shareUrl);
    } else {
      setCharacter2Url(character.shareUrl);
    }
    
    // Update selected characters list
    setSelectedCharacters(prev => {
      const filtered = prev.filter(c => c.slug !== character.slug);
      return [...filtered, character];
    });
    
    setCurrentPage('setup');
  };

  const backFromCharacterSelector = () => {
    setCurrentPage('setup');
  };

  if (currentPage === 'landing') {
    return <LandingPage onStartSetup={startSetup} />;
  }

  if (currentPage === 'setup') {
    return (
      <SetupPage
        character1Url={character1Url}
        setCharacter1Url={setCharacter1Url}
        character2Url={character2Url}
        setCharacter2Url={setCharacter2Url}
        initialPrompt={initialPrompt}
        setInitialPrompt={setInitialPrompt}
        onStartChatroom={startChatroom}
        onBack={resetApp}
        onSelectCharacter={openCharacterSelector}
      />
    );
  }

  if (currentPage === 'character-selector') {
    return (
      <CharacterSelector
        onCharacterSelect={handleCharacterSelect}
        onBack={backFromCharacterSelector}
        selectedCharacters={selectedCharacters}
        title={`Select Character ${characterSelectorTarget}`}
      />
    );
  }

  return (
    <ChatroomPage
      character1Name={character1Name}
      character2Name={character2Name}
      messages={messages}
      isGenerating={isGenerating}
      currentTurn={currentTurn}
      onGenerateNextMessage={generateNextMessage}
      onGoBackToSetup={goBackToSetup}
      onReset={resetApp}
    />
  );
};

export default App;