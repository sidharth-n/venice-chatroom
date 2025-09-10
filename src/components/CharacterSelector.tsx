import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Search, X, Star, Globe, MessageCircle, Hash, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { VeniceCharacter, fetchVeniceCharacters } from '../services/veniceApi';
import { loadCharacters, saveCharacters } from '../utils/localStorage';
import { getSafePhotoUrl } from '../utils';
import { imageCache } from '../utils/imageCache';

// Local avatar component with lazy image and fallback
const Avatar: React.FC<{ name: string; photoUrl?: string; size?: number }> = ({ name, photoUrl, size = 64 }) => {
  const letter = useMemo(() => name.charAt(0).toUpperCase(), [name]);
  const safeUrl = photoUrl ? (getSafePhotoUrl(photoUrl) || photoUrl) : undefined;
  const displayUrl = safeUrl ? imageCache.getDisplayUrl(safeUrl) : undefined;
  const isCached = safeUrl ? imageCache.isImageCached(safeUrl) : false;
  return (
    <div
      className="relative rounded-lg overflow-hidden bg-venice-cream border border-venice-stone border-opacity-20"
      style={{ width: '100%', height: size }}
    >
      {/* Fallback visible immediately */}
      <div className="absolute inset-0 flex items-center justify-center text-venice-olive-brown z-0">
        <div className="w-10 h-10 rounded-full bg-venice-cream flex items-center justify-center border border-venice-stone border-opacity-30 shadow-sm">
          <span className="font-semibold">{letter}</span>
        </div>
      </div>
      {/* Image overlays with face-centric crop and fade-in */}
      {displayUrl ? (
        <img
          src={displayUrl}
          alt={`${name} photo`}
          loading="eager"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-contain ${isCached ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '1';
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
    </div>
  );
};

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
  selectedCharacters: _selectedCharacters,
  title,
  cachedCharacters,
  setCachedCharacters
}) => {
  const [characters, setCharacters] = useState<VeniceCharacter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCharacterForPopup, setSelectedCharacterForPopup] = useState<VeniceCharacter | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [charactersPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || character.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
  const startIndex = (currentPage - 1) * charactersPerPage;
  const paginatedCharacters = filteredCharacters.slice(startIndex, startIndex + charactersPerPage);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag]);

  // Scroll to top on page change for a better UX on pagination
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const loadCharactersData = useCallback(async () => {
    // Try to load from localStorage first
    const cachedData = loadCharacters();
    if (cachedData) {
      setCharacters(cachedData);
      setLoading(false);
      return;
    }

    // If no cached data or cached data is from app state, fetch from API
    if (cachedCharacters) {
      setCharacters(cachedCharacters);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedCharacters = await fetchVeniceCharacters();
      setCharacters(fetchedCharacters);
      setCachedCharacters(fetchedCharacters);
      // Save to localStorage
      saveCharacters(fetchedCharacters);
    } catch {
      setError('Failed to load characters. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [cachedCharacters, setCachedCharacters]);

  useEffect(() => {
    loadCharactersData();
  }, [loadCharactersData]);

  // Acknowledge selected characters prop (may be used for future highlighting)
  useEffect(() => {
    // no-op: ensures prop is observed for potential UI updates
  }, [_selectedCharacters]);

  // Preload only the first page of images and gate grid render until ready
  useEffect(() => {
    if (characters.length > 0) {
      setImagesReady(false);
      const firstPage = characters.slice(0, charactersPerPage);
      const imagesToPreload = firstPage
        .map(char => char.photoUrl)
        .filter((url): url is string => Boolean(url))
        .map(url => getSafePhotoUrl(url) || url);

      if (imagesToPreload.length === 0) {
        setImagesReady(true);
        return;
      }

      imageCache.preloadMultiple(imagesToPreload).then(() => setImagesReady(true));
    }
  }, [characters, charactersPerPage]);

  const getAllTags = () => {
    const allTags = characters.flatMap(char => char.tags);
    return [...new Set(allTags)].sort();
  };

  const handleCharacterClick = (character: VeniceCharacter) => {
    setSelectedCharacterForPopup(character);
    // Prevent background scroll when popup opens
    document.body.style.overflow = 'hidden';
  };

  const handleSelectFromPopup = (character: VeniceCharacter) => {
    onCharacterSelect(character);
    setSelectedCharacterForPopup(null);
    // Restore background scroll when popup closes
    document.body.style.overflow = 'unset';
  };

  const closePopup = () => {
    setSelectedCharacterForPopup(null);
    // Restore background scroll when popup closes
    document.body.style.overflow = 'unset';
  };

  if (loading || !imagesReady) {
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
        <div className="text-center">
          <div className="text-center mb-6 sm:mb-8">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-venice-olive-brown mx-auto mb-3 sm:mb-4" />
            <h3 className="text-3xl sm:text-4xl font-bold text-venice-olive-brown mb-2">{title}</h3>
          </div>
          <div className="space-y-3">
              <button
                onClick={loadCharactersData}
                className="w-full bg-venice-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="w-full bg-venice-stone hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Setup
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
         {/*  <div className="flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-venice-olive-brown mr-2" />
            <p className="text-lg text-venice-dark-olive">
              Choose from <span className="font-semibold">100s of</span> available characters
            </p>
          </div> */}
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
          {/* <div className="mt-4 text-venice-dark-olive text-sm">
            Showing <span className="font-semibold">{filteredCharacters.length}</span> of <span className="font-semibold">{characters.length}</span> characters
          </div> */}
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {paginatedCharacters.map((character) => {
            return (
              <div
                key={character.slug}
                onClick={() => handleCharacterClick(character)}
                className="bg-venice-white rounded-lg p-4 sm:p-6 shadow-sm border border-venice-stone border-opacity-20 hover:border-venice-red hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {/* Image / Avatar */}
                <div className="mb-3">
                  <Avatar name={character.name} photoUrl={getSafePhotoUrl(character.photoUrl)} size={160} />
                </div>

                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-venice-olive-brown line-clamp-2">{character.name}</h3>
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

                <div className="flex justify-center items-center text-xs text-venice-dark-olive">
                  <span className="flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    {character.stats.imports} imports
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-8 px-4">
            {/* Mobile: Stack buttons vertically */}
            <div className="flex sm:hidden w-full justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-2 bg-venice-white border border-venice-stone border-opacity-30 rounded-lg hover:bg-venice-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-medium transition-colors text-sm ${
                        currentPage === pageNum
                          ? 'bg-venice-red text-white'
                          : 'bg-venice-white border border-venice-stone border-opacity-30 text-venice-olive-brown hover:bg-venice-cream'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-2 bg-venice-white border border-venice-stone border-opacity-30 rounded-lg hover:bg-venice-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop: Horizontal layout */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-venice-white border border-venice-stone border-opacity-30 rounded-lg hover:bg-venice-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-venice-red text-white'
                          : 'bg-venice-white border border-venice-stone border-opacity-30 text-venice-olive-brown hover:bg-venice-cream'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 py-2 bg-venice-white border border-venice-stone border-opacity-30 rounded-lg hover:bg-venice-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Page info for mobile */}
            <div className="sm:hidden text-xs text-venice-dark-olive">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}

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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-hidden">
            <div className="bg-venice-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
              {/* Popup Header */}
              <div className="flex items-center justify-between p-3 sm:p-6 border-b border-venice-stone border-opacity-20">
                <h3 className="text-lg sm:text-xl font-bold text-venice-olive-brown">Character Details</h3>
                <button
                  onClick={closePopup}
                  className="text-venice-dark-olive hover:text-venice-olive-brown transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Popup Content */}
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="space-y-3">
                  {/* Character Photo */}
                  <div>
                    <Avatar name={selectedCharacterForPopup.name} photoUrl={getSafePhotoUrl(selectedCharacterForPopup.photoUrl)} size={220} />
                  </div>
                  
                  {/* Character Name */}
                  <div>
                    <h3 className="text-lg font-bold text-venice-olive-brown mb-1 leading-tight">
                      {selectedCharacterForPopup.name}
                    </h3>
                  </div>

                  {/* Character Stats */}
                  <div className="grid grid-cols-1 gap-2">
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
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-venice-olive-brown mb-1">Description</h4>
                    <div className="max-h-32 overflow-y-auto">
                      <p className="text-venice-dark-olive leading-relaxed text-sm">
                        {selectedCharacterForPopup.description}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-sm font-semibold text-venice-olive-brown mb-1 flex items-center">
                      <Hash className="w-4 h-4 mr-1 flex-shrink-0" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCharacterForPopup.tags.slice(0, 6).map(tag => (
                        <span
                          key={tag}
                          className="bg-venice-cream text-venice-olive-brown text-xs px-2 py-1 rounded-full border border-venice-stone border-opacity-30"
                        >
                          {tag}
                        </span>
                      ))}
                      {selectedCharacterForPopup.tags.length > 6 && (
                        <span className="text-xs text-venice-dark-olive">
                          +{selectedCharacterForPopup.tags.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Popup Footer */}
              <div className="p-4 border-t border-venice-stone border-opacity-20 flex-shrink-0">
                <button
                  onClick={() => handleSelectFromPopup(selectedCharacterForPopup)}
                  className="w-full px-4 py-2.5 rounded-lg font-medium transition-colors text-sm bg-venice-red text-white hover:bg-red-700"
                >
                  Select Character
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
