import React, { useState, useEffect } from 'react';
import { VeniceCharacter, fetchVeniceCharacters } from '../services/veniceApi';

interface CharacterSelectorProps {
  onCharacterSelect: (character: VeniceCharacter) => void;
  onBack: () => void;
  selectedCharacters: VeniceCharacter[];
  title: string;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  onCharacterSelect,
  onBack,
  selectedCharacters,
  title
}) => {
  const [characters, setCharacters] = useState<VeniceCharacter[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<VeniceCharacter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    filterCharacters();
  }, [characters, searchTerm, selectedTag]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await fetchVeniceCharacters();
      setCharacters(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const filterCharacters = () => {
    let filtered = characters;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(char =>
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(char =>
        char.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    setFilteredCharacters(filtered);
  };

  const getAllTags = () => {
    const allTags = characters.flatMap(char => char.tags);
    return [...new Set(allTags)].sort();
  };

  const isCharacterSelected = (character: VeniceCharacter) => {
    return selectedCharacters.some(selected => selected.slug === character.slug);
  };

  const handleCharacterClick = (character: VeniceCharacter) => {
    if (!isCharacterSelected(character)) {
      onCharacterSelect(character);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-red-200">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-200 mb-4">Error Loading Characters</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadCharacters}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-200 mb-2">{title}</h1>
          <p className="text-red-300">Choose from {characters.length} available characters</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-black/30 rounded-lg p-6 mb-8 backdrop-blur-sm border border-red-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-red-200 text-sm font-bold mb-2">
                Search Characters
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or tags..."
                className="w-full px-4 py-3 bg-black/50 border border-red-800/50 rounded-lg text-red-100 placeholder-red-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-red-200 text-sm font-bold mb-2">
                Filter by Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-red-800/50 rounded-lg text-red-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="">All Tags</option>
                {getAllTags().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-red-300 text-sm">
            Showing {filteredCharacters.length} of {characters.length} characters
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCharacters.map((character) => {
            const isSelected = isCharacterSelected(character);
            return (
              <div
                key={character.slug}
                onClick={() => handleCharacterClick(character)}
                className={`
                  bg-black/30 rounded-lg p-6 backdrop-blur-sm border transition-all duration-200 cursor-pointer
                  ${isSelected 
                    ? 'border-green-500 bg-green-900/20 cursor-not-allowed' 
                    : 'border-red-800/30 hover:border-red-500 hover:bg-red-900/20'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-red-200">{character.name}</h3>
                  {isSelected && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                
                <p className="text-red-300 text-sm mb-4 line-clamp-3">
                  {character.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {character.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="bg-red-800/50 text-red-200 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {character.tags.length > 3 && (
                    <span className="text-red-400 text-xs">
                      +{character.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-red-400">
                  <span>{character.stats.imports} imports</span>
                  <span>{character.webEnabled ? '🌐 Web' : '💬 Chat'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-red-200 mb-2">No Characters Found</h3>
            <p className="text-red-300 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('');
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            ← Back to Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelector;
