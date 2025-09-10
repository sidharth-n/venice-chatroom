import React, { useState, useEffect, useRef } from 'react';
import { PageType, Message } from './types';
import { getCharacterName, getCharacterSlug } from './utils';
import { callVeniceApi, VeniceMessage, VeniceCharacter } from './services/veniceApi';
import { 
  generateStorageKey, 
  saveConversation, 
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
  const [cachedCharacters, setCachedCharacters] = useState<VeniceCharacter[] | null>(null);

  const character1Name = getCharacterName(character1Url);
  const character2Name = getCharacterName(character2Url);
  
  // Generate storage key for current conversation
  const storageKey = character1Name && character2Name 
    ? generateStorageKey(character1Name, character2Name, initialPrompt)
    : '';

  // Load conversation on component mount and cleanup old conversations
  useEffect(() => {
    cleanupOldConversations();
  }, []);

  // Removed this useEffect to prevent duplicate loading since we handle it in startChatroom

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
    // Ensure clean slate when opening setup
    setCharacter1Url('');
    setCharacter2Url('');
    setInitialPrompt('');
    setSelectedCharacters([]);
    setCurrentPage('setup');
  };

  // Guard to prevent duplicate initializations
  const startChatroomGuard = useRef(false);
  // Keep a ref of latest messages to avoid stale state in timeouts
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const startChatroom = () => {
    if (startChatroomGuard.current) return; // prevent double-invocation
    startChatroomGuard.current = true;
    if (character1Url.trim() && character2Url.trim() && initialPrompt.trim()) {
      const newStorageKey = generateStorageKey(
        getCharacterName(character1Url),
        getCharacterName(character2Url),
        initialPrompt
      );

      // Always start a fresh conversation for the given settings
      clearConversation(newStorageKey);

      setCurrentPage('chatroom');
      setIsGenerating(false);
      setPendingUserResponse(false);
      setLastProcessedMessageId(null);
      setMessages([]);
      setCurrentTurn(1);

      // Seed the first user message and trigger AI via the existing flow
      handleUserMessage(initialPrompt);

      // Reset scroll position when entering chatroom
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  };

  const generateNextMessage = async (messagesSnapshot?: Message[]) => {
    if (isGenerating) return; // Prevent multiple simultaneous generations
    
    setIsGenerating(true);
    
    try {
      const currentCharacterUrl = currentTurn === 1 ? character1Url : character2Url;
      const currentCharacterSlug = getCharacterSlug(currentCharacterUrl);
      const currentCharacter = currentTurn === 1 ? character1Name : character2Name;
      
      // Build conversation history for API
      const conversationHistory: VeniceMessage[] = [];
      
      // Get snapshot to avoid stale closure
      const currentMessages = (messagesSnapshot && messagesSnapshot.length >= 0) ? messagesSnapshot : messagesRef.current;
      
      // If empty for any reason, we'll still proceed and add a default prompt below

      // Add all messages to conversation history
      currentMessages.forEach(msg => {
        if (msg.character === 'User') {
          conversationHistory.push({
            role: 'user',
            content: msg.content
          });
        } else if (msg.character === currentCharacter) {
          // Current character's previous messages
          conversationHistory.push({
            role: 'assistant',
            content: msg.content
          });
        } else {
          // Other character's messages (treat as user for context)
          conversationHistory.push({
            role: 'user',
            content: `${msg.character}: ${msg.content}`
          });
        }
      });
      
      // Ensure we have at least one message for the API
      if (conversationHistory.length === 0) {
        conversationHistory.push({
          role: 'user',
          content: 'Hello, please start our conversation.'
        });
      }
      
      const response = await callVeniceApi(conversationHistory, currentCharacterSlug, currentMessages.length);
      
      const newMessage: Message = {
        id: Date.now(), // Use timestamp as unique ID to prevent duplicates
        character: currentCharacter,
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
    } catch (error) {
      console.error('Failed to generate message:', error);
      // Add a graceful fallback assistant message so the chat continues
      const fallbackMessage: Message = {
        id: Date.now(),
        character: currentTurn === 1 ? character1Name : character2Name,
        content: "I'm having trouble responding right now, but let's keep chatting. Could you rephrase or continue?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
    } finally {
      setIsGenerating(false);
    }
  };

  const [pendingUserResponse, setPendingUserResponse] = useState(false);
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<number | null>(null);

  const handleUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now(),
      character: 'User',
      content: content,
      timestamp: new Date()
    };
    // Update ref immediately to avoid stale snapshots
    messagesRef.current = [...messagesRef.current, newMessage];
    setMessages(prev => [...prev, newMessage]);
    // Let the effect handle auto-triggering the AI (avoids stale state)
    setPendingUserResponse(true);
  };

  // Effect to trigger AI response after user message is added to state
  useEffect(() => {
    if (!pendingUserResponse) return;
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.character !== 'User') return;
    // Only process if we haven't already processed this message
    if (lastProcessedMessageId === lastMessage.id) return;

    // Mark as processed and trigger generation (avoid parallel runs inside generateNextMessage)
    setPendingUserResponse(false);
    setLastProcessedMessageId(lastMessage.id);
    generateNextMessage(messages);
  }, [messages, pendingUserResponse, lastProcessedMessageId, generateNextMessage]);

  const resetApp = () => {
    // Clear saved conversation from localStorage
    if (storageKey) {
      clearConversation(storageKey);
    }
    
    setCurrentPage('landing');
    setMessages([]);
    setCurrentTurn(1);
    setIsGenerating(false);
    setPendingUserResponse(false);
    setLastProcessedMessageId(null);
    startChatroomGuard.current = false;
    // Clear setup inputs and selections
    setCharacter1Url('');
    setCharacter2Url('');
    setInitialPrompt('');
    setSelectedCharacters([]);
  };

  const goBackToSetup = () => {
    setCurrentPage('setup');
    startChatroomGuard.current = false;
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

  const handleClearConversation = () => {
    if (storageKey) {
      clearConversation(storageKey);
    }
    setMessages([]);
    setCurrentTurn(1);
    setPendingUserResponse(false); // Reset pending state to prevent duplicate responses
    setIsGenerating(false); // Ensure generating state is reset
    setLastProcessedMessageId(null); // Reset processed message tracking
  };

  const backFromCharacterSelector = () => {
    setCurrentPage('setup');
    startChatroomGuard.current = false;
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
        cachedCharacters={cachedCharacters}
        setCachedCharacters={setCachedCharacters}
      />
    );
  }

  // Get character details from selected characters
  const character1Details = selectedCharacters.find(char => char.shareUrl === character1Url);
  const character2Details = selectedCharacters.find(char => char.shareUrl === character2Url);

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
      onUserMessage={handleUserMessage}
      character1Details={character1Details}
      character2Details={character2Details}
      onClearConversation={handleClearConversation}
    />
  );
};

export default App;