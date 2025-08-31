import React from 'react';
import { Users, ArrowLeft, Send } from 'lucide-react';
import { getCharacterName } from '../utils';

interface SetupPageProps {
  character1Url: string;
  character2Url: string;
  initialPrompt: string;
  setCharacter1Url: (url: string) => void;
  setCharacter2Url: (url: string) => void;
  setInitialPrompt: (prompt: string) => void;
  onStartChatroom: () => void;
  onBack: () => void;
  onSelectCharacter: (target: 1 | 2) => void;
}

const SetupPage: React.FC<SetupPageProps> = ({
  character1Url,
  character2Url,
  initialPrompt,
  setCharacter1Url,
  setCharacter2Url,
  setInitialPrompt,
  onStartChatroom,
  onBack,
  onSelectCharacter
}) => {
  const character1Name = getCharacterName(character1Url);
  const character2Name = getCharacterName(character2Url);

  return (
    <div className="min-h-screen bg-venice-cream flex flex-col">
      {/* Header */}
      <div className="bg-venice-white shadow-sm border-b border-venice-stone border-opacity-30 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-venice-stone hover:text-venice-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-semibold text-venice-olive-brown">Setup Characters</h2>
          <div className="w-12" />
        </div>
      </div>

      {/* Setup Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <div className="text-center mb-6 sm:mb-8">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-venice-olive-brown mx-auto mb-3 sm:mb-4" />
            <h3 className="text-3xl sm:text-4xl font-bold text-venice-olive-brown mb-2">Choose Your Characters</h3>
            <p className="text-lg sm:text-xl text-venice-dark-olive px-2">Enter Venice AI character URLs to start the conversation</p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-base sm:text-lg font-semibold text-venice-olive-brown mb-2">
                Character 1 URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={character1Url}
                  onChange={(e) => setCharacter1Url(e.target.value)}
                  placeholder="https://venice.ai/c/character-name"
                  className="w-full px-4 py-3 border border-venice-stone border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-venice-red focus:border-transparent text-sm sm:text-base"
                />
                <button
                  onClick={() => onSelectCharacter(1)}
                  className="absolute bottom-1 right-1 text-xs text-venice-red hover:text-red-700 transition-colors underline"
                >
                  Browse Characters
                </button>
              </div>
              {character1Url && (
                <p className="text-base sm:text-lg text-venice-dark-olive mt-1">Character: {character1Name}</p>
              )}
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-venice-olive-brown mb-2">
                Character 2 URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={character2Url}
                  onChange={(e) => setCharacter2Url(e.target.value)}
                  placeholder="https://venice.ai/c/character-name"
                  className="w-full px-4 py-3 border border-venice-stone border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-venice-red focus:border-transparent text-sm sm:text-base"
                />
                <button
                  onClick={() => onSelectCharacter(2)}
                  className="absolute bottom-1 right-1 text-xs text-venice-red hover:text-red-700 transition-colors underline"
                >
                  Browse Characters
                </button>
              </div>
              {character2Url && (
                <p className="text-base sm:text-lg text-venice-dark-olive mt-1">Character: {character2Name}</p>
              )}
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-venice-olive-brown mb-2">
                Conversation Topic
              </label>
              <textarea
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="Describe the scenario or conversation starter..."
                rows={4}
                className="w-full px-4 py-3 border border-venice-stone border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-venice-red focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={onStartChatroom}
              disabled={!character1Url.trim() || !character2Url.trim() || !initialPrompt.trim()}
              className="w-full bg-venice-bright-red text-venice-white py-4 sm:py-5 px-4 sm:px-6 rounded-xl font-semibold text-xl sm:text-2xl shadow-lg hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Start Conversation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
