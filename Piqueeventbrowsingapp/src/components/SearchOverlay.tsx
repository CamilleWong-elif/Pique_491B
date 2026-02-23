import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Mic, MapPin, X } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery: string;
  onNavigateToExplore: (category: string) => void;
  location?: string;
  onLocationChange?: (location: string) => void;
}

export function SearchOverlay({ isOpen, onClose, initialQuery, onNavigateToExplore, location: propLocation, onLocationChange }: SearchOverlayProps) {
  const [searchText, setSearchText] = useState(initialQuery);
  const [location, setLocation] = useState(propLocation || 'Los Angeles, CA');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isLocationMode, setIsLocationMode] = useState(false);
  const [locationSearchText, setLocationSearchText] = useState('');

  useEffect(() => {
    setSearchText(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (propLocation) {
      setLocation(propLocation);
    }
  }, [propLocation]);

  if (!isOpen) return null;

  // Limited list of available cities
  const allCities = [
    { city: 'Anaheim', state: 'CA' },
    { city: 'Garden Grove', state: 'CA' },
    { city: 'Long Beach', state: 'CA' },
    { city: 'Los Angeles', state: 'CA' },
    { city: 'Westminster', state: 'CA' },
  ];

  const filteredCities = locationSearchText
    ? allCities.filter(loc =>
        `${loc.city}, ${loc.state}`.toLowerCase().includes(locationSearchText.toLowerCase())
      )
    : allCities;

  const handleLocationSelect = (city: string, state: string) => {
    setLocation(`${city}, ${state}`);
    setIsLocationMode(false);
    setLocationSearchText('');
    if (onLocationChange) {
      onLocationChange(`${city}, ${state}`);
    }
  };

  const handleCurrentLocation = () => {
    // Default to Los Angeles, CA
    setLocation('Los Angeles, CA');
    setIsLocationMode(false);
    setLocationSearchText('');
    if (onLocationChange) {
      onLocationChange('Los Angeles, CA');
    }
  };

  // Quick action chips
  const quickActions = ['Entertainment', 'Arts & Culture', 'Wellness'];

  // Recently searched items
  const recentSearches = [
    'Paint and Sip Classes',
    'Yoga Studios',
    'Live Music Venues',
    'Comedy Shows'
  ];

  // Event suggestions based on search text
  const getSuggestions = () => {
    if (!searchText.trim()) return [];
    
    const allSuggestions = [
      'Outdoor Activities',
      'Outdoor Yoga Classes',
      'Outdoor Concerts',
      'Hiking Groups',
      'Rock Climbing',
      'Kayaking Adventures',
      'Beach Volleyball',
      'Cycling Tours',
      'Arts & Crafts Workshops',
      'Paint and Sip',
      'Pottery Classes',
      'Dance Classes',
      'Fitness Bootcamp',
      'Comedy Shows',
      'Live Music',
      'Theater Performances',
      'Museum Tours',
      'Wine Tasting',
      'Cooking Classes',
      'Photography Walks'
    ];

    return allSuggestions.filter(s => 
      s.toLowerCase().includes(searchText.toLowerCase())
    ).slice(0, 6);
  };

  const suggestions = getSuggestions();

  const handleSearchSubmit = () => {
    onNavigateToExplore(searchText);
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchText(suggestion);
    onNavigateToExplore(suggestion);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-white z-[70] flex flex-col h-[932px] w-full">
      {/* Header */}
      <div className="px-4 pt-[52px] pb-3 border-b border-gray-200">
        {/* Top Bar with Back and Mic */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => {
              if (isLocationMode) {
                setIsLocationMode(false);
                setLocationSearchText('');
              } else {
                onClose();
              }
            }}
            className="flex-shrink-0 text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2.5 flex items-center gap-2">
            {!isLocationMode ? (
              <>
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="Type or search with your voice"
                  className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
                  autoFocus={!isLocationMode}
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </>
            ) : null}
          </div>

          <button className="flex-shrink-0 text-gray-700">
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Location Input Row */}
        {!isLocationMode ? (
          <button 
            onClick={() => setIsLocationMode(true)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MapPin className="w-[18px] h-[18px] text-gray-500" />
            <span className="text-[15px] text-blue-500 font-medium">Current Location</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <MapPin className="w-[18px] h-[18px] text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={locationSearchText}
              onChange={(e) => setLocationSearchText(e.target.value)}
              placeholder="Neighborhood, city, state or zip code"
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
              autoFocus={isLocationMode}
            />
            {locationSearchText && (
              <button
                onClick={() => setLocationSearchText('')}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-[280px]">
        {isLocationMode ? (
          <>
            {/* Current Location Option */}
            <button
              onClick={handleCurrentLocation}
              className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100"
            >
              <div className="w-[18px] h-[18px] text-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-[15px] text-blue-500 font-medium">Current Location</span>
            </button>

            {/* Cities List */}
            {filteredCities.slice(0, 20).map((city, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(city.city, city.state)}
                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100"
              >
                <div className="w-[18px] h-[18px] text-gray-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <span className="text-[15px] text-gray-900">{city.city}, {city.state}</span>
                </div>
              </button>
            ))}
          </>
        ) : (
          <>
            {/* Quick Actions */}
            {!searchText && (
              <div className="px-4 py-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setSearchText(action);
                        handleSuggestionClick(action);
                      }}
                      className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-b border-gray-200">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Suggestions</h3>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-left">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recently Searched */}
            {!searchText && (
              <div className="mt-4">
                <div className="px-4 py-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Recently Searched</h3>
                  <button className="text-xs text-blue-500">Clear</button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-left">{search}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* iOS Keyboard */}
      {showKeyboard && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#D1D5DB] border-t border-gray-300">
          {/* Suggestion Bar */}
          <div className="bg-[#D1D5DB] px-2 py-1.5 flex items-center gap-2 overflow-x-auto border-b border-gray-300">
            {!isLocationMode && suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex-shrink-0 px-3 py-1.5 bg-white rounded text-xs shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Keyboard Layout */}
          <div className="p-1">
            {/* First Row */}
            <div className="flex gap-[6px] mb-2 justify-center">
              {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isLocationMode) {
                      setLocationSearchText(prev => prev + key.toLowerCase());
                    } else {
                      setSearchText(prev => prev + key.toLowerCase());
                    }
                  }}
                  className="flex-1 h-[42px] bg-white rounded shadow-sm text-base font-normal"
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Second Row */}
            <div className="flex gap-[6px] mb-2 justify-center px-4">
              {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isLocationMode) {
                      setLocationSearchText(prev => prev + key.toLowerCase());
                    } else {
                      setSearchText(prev => prev + key.toLowerCase());
                    }
                  }}
                  className="flex-1 h-[42px] bg-white rounded shadow-sm text-base font-normal"
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Third Row */}
            <div className="flex gap-[6px] mb-2">
              <button
                onClick={() => {
                  if (isLocationMode) {
                    setLocationSearchText(prev => prev.toUpperCase());
                  } else {
                    setSearchText(prev => prev.toUpperCase());
                  }
                }}
                className="flex-1 h-[42px] bg-[#ABB3BD] rounded shadow-sm flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3l6 9H4l6-9z" />
                </svg>
              </button>
              {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isLocationMode) {
                      setLocationSearchText(prev => prev + key.toLowerCase());
                    } else {
                      setSearchText(prev => prev + key.toLowerCase());
                    }
                  }}
                  className="flex-1 h-[42px] bg-white rounded shadow-sm text-base font-normal"
                >
                  {key}
                </button>
              ))}
              <button
                onClick={() => {
                  if (isLocationMode) {
                    setLocationSearchText(prev => prev.slice(0, -1));
                  } else {
                    setSearchText(prev => prev.slice(0, -1));
                  }
                }}
                className="flex-1 h-[42px] bg-[#ABB3BD] rounded shadow-sm flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l-4-4m0 0l4-4m-4 4h12" />
                </svg>
              </button>
            </div>

            {/* Fourth Row */}
            <div className="flex gap-[6px]">
              <button
                className="w-[45px] h-[42px] bg-[#ABB3BD] rounded shadow-sm text-sm"
              >
                123
              </button>
              <button
                onClick={() => {
                  if (isLocationMode) {
                    setLocationSearchText(prev => prev + ' ');
                  } else {
                    setSearchText(prev => prev + ' ');
                  }
                }}
                className="flex-1 h-[42px] bg-white rounded shadow-sm text-sm"
              >
                space
              </button>
              <button
                onClick={handleSearchSubmit}
                className="w-[70px] h-[42px] bg-blue-500 rounded shadow-sm text-white text-sm font-semibold"
              >
                search
              </button>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="flex justify-center py-2">
            <div className="w-[134px] h-[5px] bg-black rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}