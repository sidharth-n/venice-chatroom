import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, X, Calendar, Hash, Globe, MessageCircle, Star, Users } from 'lucide-react';
import { VeniceCharacter, fetchVeniceCharacters } from '../services/veniceApi';

interface CharacterSelectorProps {
  onCharacterSelect: (character: VeniceCharacter) => void;
  onBack: () => void;
  selectedCharacters: VeniceCharacter[];
  title: string;
  cachedCharacters: VeniceCharacter[] | null;
  setCachedCharacters: (characters: VeniceCharacter[]) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  onCharacterSelect,
  onBack,
  selectedCharacters,
  title,
  cachedCharacters,
  setCachedCharacters
}) => {
  const [characters, setCharacters] = useState<VeniceCharacter[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<VeniceCharacter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacterForPopup, setSelectedCharacterForPopup] = useState<VeniceCharacter | null>(null);

  const filterCharacters = useCallback(() => {
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
  }, [characters, searchTerm, selectedTag]);

  useEffect(() => {
    loadCharacters();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterCharacters();
  }, [filterCharacters]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      
      // Use cached characters if available
      if (cachedCharacters && cachedCharacters.length > 0) {
        setCharacters(cachedCharacters);
        setError(null);
        setLoading(false);
        return;
      }

      // Fetch fresh data if no cache
      const data = await fetchVeniceCharacters();
      setCharacters(data);
      setCachedCharacters(data); // Cache the results
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const getAllTags = () => {
    const allTags = characters.flatMap(char => char.tags);
    return [...new Set(allTags)].sort();
  };

  const isCharacterSelected = (character: VeniceCharacter) => {
    return selectedCharacters.some(selected => selected.slug === character.slug);
  };

  const handleCharacterClick = (character: VeniceCharacter) => {
    setSelectedCharacterForPopup(character);
  };

  const handleSelectFromPopup = (character: VeniceCharacter) => {
    if (!isCharacterSelected(character)) {
      onCharacterSelect(character);
    }
    setSelectedCharacterForPopup(null);
  };

  const closePopup = () => {
    setSelectedCharacterForPopup(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-venice-cream flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-venice-red mx-auto mb-4"></div>
          <p className="text-venice-olive-brown text-lg">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-venice-cream flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-venice-red text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-venice-olive-brown mb-4">Error Loading Characters</h2>
          <p className="text-venice-dark-olive mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadCharacters}
              className="w-full bg-venice-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="w-full bg-venice-stone hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-venice-cream">
      {/* Header */}
      <div className="bg-venice-white shadow-sm border-b border-venice-stone border-opacity-30 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-venice-stone hover:text-venice-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Setup</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-venice-olive-brown">{title}</h1>
          <div className="w-20 sm:w-28" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Stats and Search */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-venice-olive-brown mr-2" />
            <p className="text-lg text-venice-dark-olive">
              Choose from <span className="font-semibold">{characters.length}</span> available characters
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-venice-white rounded-lg p-4 sm:p-6 mb-6 shadow-sm border border-venice-stone border-opacity-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-semibold text-venice-olive-brown mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Characters
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or tags..."
                className="w-full px-4 py-3 border border-venice-stone border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-venice-red focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-semibold text-venice-olive-brown mb-2">
                Filter by Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-3 border border-venice-stone border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-venice-red focus:border-transparent text-sm sm:text-base"
              >
                <option value="">All Tags</option>
                {getAllTags().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-venice-dark-olive text-sm">
            Showing <span className="font-semibold">{filteredCharacters.length}</span> of <span className="font-semibold">{characters.length}</span> characters
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {filteredCharacters.map((character) => {
            const isSelected = isCharacterSelected(character);
            return (
              <div
                key={character.slug}
                onClick={() => handleCharacterClick(character)}
                className="bg-venice-white rounded-lg p-4 sm:p-6 shadow-sm border border-venice-stone border-opacity-20 hover:border-venice-red hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-venice-olive-brown line-clamp-2">{character.name}</h3>
                  {isSelected && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                      Selected
                    </span>
                  )}
                </div>
                
                <p className="text-venice-dark-olive text-sm mb-4 line-clamp-3">
                  {character.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {character.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="bg-venice-cream text-venice-olive-brown text-xs px-2 py-1 rounded-full border border-venice-stone border-opacity-30"
                    >
                      {tag}
                    </span>
                  ))}
                  {character.tags.length > 3 && (
                    <span className="text-venice-dark-olive text-xs">
                      +{character.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-venice-dark-olive">
                  <span className="flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    {character.stats.imports} imports
                  </span>
                  <span>{character.webEnabled ? '🌐 Web' : '💬 Chat'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-venice-stone text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-venice-olive-brown mb-2">No Characters Found</h3>
            <p className="text-venice-dark-olive mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('');
              }}
              className="bg-venice-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Character Detail Popup */}
        {selectedCharacterForPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-venice-white rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-0">
              {/* Popup Header */}
              <div className="flex items-center justify-between p-3 sm:p-6 border-b border-venice-stone border-opacity-20">
                <h2 className="text-lg sm:text-xl font-bold text-venice-olive-brown pr-2">Character Details</h2>
                <button
                  onClick={closePopup}
                  className="p-2 hover:bg-venice-cream rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-venice-stone" />
                </button>
              </div>

              {/* Popup Content */}
              <div className="p-3 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
                <div className="space-y-4 sm:space-y-6">
                  {/* Character Name */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-venice-olive-brown mb-2 leading-tight">
                      {selectedCharacterForPopup.name}
                    </h3>
                  </div>

                  {/* Character Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                          <MessageCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Chat Only</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-venice-dark-olive">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{new Date(selectedCharacterForPopup.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-venice-olive-brown mb-2 sm:mb-3">Description</h4>
                    <p className="text-venice-dark-olive leading-relaxed text-sm sm:text-base">
                      {selectedCharacterForPopup.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-venice-olive-brown mb-2 sm:mb-3 flex items-center">
                      <Hash className="w-4 h-4 mr-1 flex-shrink-0" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacterForPopup.tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-venice-cream text-venice-olive-brown text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full border border-venice-stone border-opacity-30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Character URL */}
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-venice-olive-brown mb-2 sm:mb-3">Character URL</h4>
                    <div className="bg-venice-cream p-2 sm:p-3 rounded-lg border border-venice-stone border-opacity-20">
                      <code className="text-xs sm:text-sm text-venice-dark-olive break-all block">
                        {selectedCharacterForPopup.shareUrl}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popup Footer */}
              <div className="p-3 sm:p-6 border-t border-venice-stone border-opacity-20">
                <button
                  onClick={() => handleSelectFromPopup(selectedCharacterForPopup)}
                  disabled={isCharacterSelected(selectedCharacterForPopup)}
                  className={`w-full px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    isCharacterSelected(selectedCharacterForPopup)
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-venice-red text-white hover:bg-red-700'
                  }`}
                >
                  {isCharacterSelected(selectedCharacterForPopup) ? 'Already Selected' : 'Select Character'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSelector;
