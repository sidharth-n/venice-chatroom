import React, { useRef, useEffect } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';
import ThinkingIndicator from './ThinkingIndicator';

interface MessageListProps {
  messages: MessageType[];
  isGenerating: boolean;
  currentTurn: 1 | 2;
  character1Name: string;
  character2Name: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isGenerating,
  currentTurn,
  character1Name,
  character2Name
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ensure proper scroll position on initial load
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-24">
      <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
        {messages.map((message) => {
          // Calculate alternating sides for character messages only
          const characterMessages = messages.filter(m => m.character !== 'You');
          const characterIndex = characterMessages.findIndex(m => m.id === message.id);
          const isLeftSide = characterIndex % 2 === 0;
          
          return (
            <Message
              key={message.id}
              message={message}
              isLeftSide={isLeftSide}
            />
          );
        })}
        
        {/* Thinking indicator when generating */}
        {isGenerating && (
          <ThinkingIndicator
            characterName={currentTurn === 1 ? character1Name : character2Name}
            isLeftSide={messages.filter(m => m.character !== 'You').length % 2 === 0}
          />
        )}
        
        {/* Invisible div for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
