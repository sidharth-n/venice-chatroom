import React from 'react';

interface ThinkingIndicatorProps {
  characterName: string;
  isLeftSide: boolean;
  avatarUrl?: string;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ characterName, isLeftSide, avatarUrl }) => {
  const avatarBg = isLeftSide ? 'bg-venice-bright-red' : 'bg-venice-olive-brown';
  const avatarLetter = characterName.charAt(0).toUpperCase();
  
  return (
    <div className={`flex ${isLeftSide ? 'justify-start' : 'justify-end'} items-end space-x-2 mb-3 sm:mb-4`}>
      {/* Left side avatar */}
      {isLeftSide && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${characterName} avatar`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const parent = (e.currentTarget.parentElement as HTMLDivElement);
                if (parent) parent.className = `w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`;
              }}
            />
          ) : (
            <div className={`w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-medium">{avatarLetter}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
        <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm border ${
          isLeftSide
            ? 'bg-venice-off-cream border-venice-stone border-opacity-30 rounded-bl-md'
            : 'bg-venice-olive-brown bg-opacity-10 border-venice-olive-brown border-opacity-20 rounded-br-md'
        }`}>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-base font-semibold text-venice-olive-brown">
              {characterName}
            </span>
            <span className="text-base text-venice-dark-olive">thinking...</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-venice-stone rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-venice-stone rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-venice-stone rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
      
      {/* Right side avatar */}
      {!isLeftSide && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${characterName} avatar`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const parent = (e.currentTarget.parentElement as HTMLDivElement);
                if (parent) parent.className = `w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`;
              }}
            />
          ) : (
            <div className={`w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-medium">{avatarLetter}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThinkingIndicator;
