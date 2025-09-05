import React from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  isLeftSide: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isLeftSide }) => {
  // Handle User messages - right-aligned like normal messaging apps
  if (message.character === 'User') {
    return (
      <div className="flex justify-end mb-3 sm:mb-4">
        <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
          <div className="bg-venice-bright-red text-venice-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm rounded-br-md">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-base font-semibold text-venice-white">You</span>
              <span className="text-base text-venice-white opacity-80">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-base sm:text-lg leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Legacy support for 'You' messages (should not occur with new flow)
  if (message.character === 'You') {
    return null;
  }

  // Character messages - alternating sides
  return (
    <div className={`flex ${isLeftSide ? 'justify-start' : 'justify-end'} mb-3 sm:mb-4`}>
      <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
        <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm ${
          isLeftSide
            ? 'bg-venice-white text-venice-olive-brown border border-venice-stone border-opacity-30 rounded-bl-md'
            : 'bg-venice-stone bg-opacity-20 text-venice-olive-brown border border-venice-stone border-opacity-30 rounded-br-md'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`text-base font-semibold ${
              isLeftSide ? 'text-venice-olive-brown' : 'text-venice-olive-brown'
            }`}>
              {message.character}
            </span>
            <span className={`text-base ${
              isLeftSide ? 'text-venice-dark-olive' : 'text-venice-dark-olive'
            }`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;
