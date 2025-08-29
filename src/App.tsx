import React, { useState } from 'react';
import { PageType, Message } from './types';
import { getCharacterName, dummyResponses } from './utils';
import LandingPage from './components/LandingPage';
import SetupPage from './components/SetupPage';
import ChatroomPage from './components/ChatroomPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [character1Url, setCharacter1Url] = useState('');
  const [character2Url, setCharacter2Url] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const character1Name = getCharacterName(character1Url);
  const character2Name = getCharacterName(character2Url);

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

  const generateNextMessage = () => {
    setIsGenerating(true);
    
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
    }, 1500);
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

  if (currentPage === 'landing') {
    return <LandingPage onStartSetup={startSetup} />;
  }

  if (currentPage === 'setup') {
    return (
      <SetupPage
        character1Url={character1Url}
        character2Url={character2Url}
        initialPrompt={initialPrompt}
        onCharacter1UrlChange={setCharacter1Url}
        onCharacter2UrlChange={setCharacter2Url}
        onInitialPromptChange={setInitialPrompt}
        onStartChatroom={startChatroom}
        onGoBack={() => setCurrentPage('landing')}
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