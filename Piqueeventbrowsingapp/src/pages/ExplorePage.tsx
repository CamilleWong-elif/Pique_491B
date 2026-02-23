import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Star, MapPin as MapPinIcon, DollarSign, Users, X, CircleHelp, Crosshair } from 'lucide-react';
import { mockEvents, categories, mockFriends, currentUser, Friend } from '../data/mockData';
import { BottomNavigation } from '../components/BottomNavigation';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { SearchOverlay } from '../components/SearchOverlay';
import { Event } from '../types/Event';
import mapBackground from 'figma:asset/40fa0068f95945d1e54c41369f4c8e6daa9d82d7.png';

interface ExplorePageProps {
  onNavigate: (page: string, eventId?: string, options?: { showPrice?: boolean, friendName?: string }) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  initialCategory?: string;
  initialSearchQuery?: string;
}

// Calculate midpoint of all user and friend locations
const calculateMidpoint = () => {
  const allLocations = [currentUser, ...mockFriends];
  const avgLat = allLocations.reduce((sum, loc) => sum + loc.lat, 0) / allLocations.length;
  const avgLng = allLocations.reduce((sum, loc) => sum + loc.lng, 0) / allLocations.length;
  return { lat: avgLat, lng: avgLng };
};

// Calculate distance between two coordinates (simplified)
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

export function ExplorePage({ onNavigate, onOpenMessages, unreadMessageCount, initialCategory, initialSearchQuery }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || initialCategory || 'Outdoor Activities');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(mockEvents[0]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [sheetHeight, setSheetHeight] = useState(450); // Initial pulled-up height
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(450);
  const [showLegend, setShowLegend] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom state: 1 = default, 2 = zoomed in
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Update search query when initialCategory or initialSearchQuery changes
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    } else if (initialCategory) {
      setSearchQuery(initialCategory);
    }
  }, [initialCategory, initialSearchQuery]);
  
  // Calculate default map offset to center the current user
  const calculateCenterOffset = () => {
    // Map bounds and container dimensions
    const mapBounds = {
      minLat: 33.70,
      maxLat: 33.95,
      minLng: -118.45,
      maxLng: -118.20
    };
    const containerWidth = 430 * 2;
    const containerHeight = 932 * 2;
    
    // Convert current user position to pixels
    const latPercent = ((currentUser.lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat));
    const lngPercent = ((currentUser.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng));
    const userTop = (1 - latPercent) * containerHeight;
    const userLeft = lngPercent * containerWidth;
    
    // Calculate offset to position user in visible area (accounting for bottom sheet)
    // Target Y position: 280px (accounts for top UI ~150px and centers in visible map area)
    // When sheet is pulled up to ~450px, visible area is top 482px
    // Center user at y=280 to be visible above the sheet and below top UI
    const targetY = 280;
    const offsetX = 430 - userLeft;
    const offsetY = (targetY + 466) - userTop;
    
    return { x: offsetX, y: offsetY };
  };
  
  // Map panning state - initialize with centered position
  const [mapOffset, setMapOffset] = useState(calculateCenterOffset());
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [mapStartPos, setMapStartPos] = useState({ x: 0, y: 0 });
  
  // Pinch zoom state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoomLevel, setInitialZoomLevel] = useState(1);
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const minHeight = 200;
  const maxHeight = 760; // Increased to allow drawer to go just below categories

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(sheetHeight);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY; // Positive when dragging up
    const newHeight = Math.min(Math.max(startHeight + diff, minHeight), maxHeight);
    setSheetHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(sheetHeight);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const currentY = e.clientY;
    const diff = startY - currentY;
    const newHeight = Math.min(Math.max(startHeight + diff, minHeight), maxHeight);
    setSheetHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY, startHeight]);

  // Map pan handlers
  const handleMapTouchStart = (e: React.TouchEvent) => {
    setIsMapDragging(true);
    setMapStartPos({
      x: e.touches[0].clientX - mapOffset.x,
      y: e.touches[0].clientY - mapOffset.y
    });
  };

  const handleMapTouchMove = (e: React.TouchEvent) => {
    if (!isMapDragging) return;
    e.preventDefault();
    const newX = e.touches[0].clientX - mapStartPos.x;
    const newY = e.touches[0].clientY - mapStartPos.y;
    setMapOffset({ x: newX, y: newY });
  };

  const handleMapTouchEnd = () => {
    setIsMapDragging(false);
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsMapDragging(true);
    setMapStartPos({
      x: e.clientX - mapOffset.x,
      y: e.clientY - mapOffset.y
    });
  };

  const handleMapMouseMove = (e: MouseEvent) => {
    if (!isMapDragging) return;
    const newX = e.clientX - mapStartPos.x;
    const newY = e.clientY - mapStartPos.y;
    setMapOffset({ x: newX, y: newY });
  };

  const handleMapMouseUp = () => {
    setIsMapDragging(false);
  };

  useEffect(() => {
    if (isMapDragging) {
      window.addEventListener('mousemove', handleMapMouseMove);
      window.addEventListener('mouseup', handleMapMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMapMouseMove);
        window.removeEventListener('mouseup', handleMapMouseUp);
      };
    }
  }, [isMapDragging, mapStartPos, mapOffset]);

  // Scroll-based zoom handler
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    // Determine zoom direction: negative deltaY = scroll up = zoom in
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(zoomLevel + zoomDelta, 0.5), 3);
    
    setZoomLevel(newZoom);
  };

  // Add wheel event listener to map container
  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      mapContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        mapContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, [zoomLevel]);

  const renderPricePoints = (pricePoint: number) => {
    return Array.from({ length: pricePoint }, () => '$').join('');
  };

  // Handler for calibration button - centers map to current user location
  const handleCalibration = () => {
    // Reset map to default position (centered, no pan, default zoom)
    setMapOffset(calculateCenterOffset());
    setZoomLevel(1);
  };

  // Handler for search overlay navigation
  const handleNavigateFromSearch = (category: string) => {
    setSearchQuery(category);
    setSelectedCategory(category);
  };

  // Calculate midpoint and find events near it
  const midpoint = calculateMidpoint();
  
  // Filter events by selected category (excluding Food & Drink)
  const activityEvents = mockEvents.filter(event => event.category !== 'Food & Drink');
  
  // Smart filtering: match by category or by keyword search
  const filteredEvents = (() => {
    if (selectedCategory === 'All') {
      return activityEvents;
    }
    
    // Check if it's a known category (exact match)
    const isKnownCategory = categories.includes(selectedCategory);
    
    if (isKnownCategory) {
      // Exact category match
      return activityEvents.filter(e => e.category === selectedCategory);
    } else {
      // Keyword search - extract keywords from search query
      const searchKeywords = searchQuery.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      return activityEvents.filter(event => {
        const eventName = event.name.toLowerCase();
        const eventCategory = event.category.toLowerCase();
        const eventLocation = `${event.city} ${event.state}`.toLowerCase();
        const eventDescription = event.description?.toLowerCase() || '';
        
        // Check if any keyword matches in event name, category, or location
        return searchKeywords.some(keyword => 
          eventName.includes(keyword) || 
          eventCategory.includes(keyword) || 
          eventLocation.includes(keyword) ||
          eventDescription.includes(keyword)
        );
      });
    }
  })();
  
  const eventsWithDistance = filteredEvents.map(event => ({
    ...event,
    distanceToMidpoint: getDistance(midpoint.lat, midpoint.lng, event.lat, event.lng)
  }));
  
  // Sort and get top 3 events closest to midpoint
  const suggestedEvents = [...eventsWithDistance]
    .sort((a, b) => a.distanceToMidpoint - b.distanceToMidpoint)
    .slice(0, 3);

  // Calculate radius based on ALL activity events (not filtered) to keep it constant
  const allEventsWithDistance = activityEvents.map(event => ({
    ...event,
    distanceToMidpoint: getDistance(midpoint.lat, midpoint.lng, event.lat, event.lng)
  }));
  
  const allSuggestedEvents = [...allEventsWithDistance]
    .sort((a, b) => a.distanceToMidpoint - b.distanceToMidpoint)
    .slice(0, 3);

  // Calculate radius for midpoint boundary (distance to farthest suggested event + padding)
  // Using all events to keep radius constant regardless of filters
  const midpointRadius = allSuggestedEvents.length > 0 
    ? Math.max(...allSuggestedEvents.map(e => e.distanceToMidpoint)) * 1.2 // 20% padding
    : 0.05; // default radius if no events

  // Function to convert lat/lng to pixel position on our map view
  // Map bounds: approximately covering the South Bay LA area
  const mapBounds = {
    minLat: 33.70,
    maxLat: 33.95,
    minLng: -118.45,
    maxLng: -118.20
  };

  const latLngToPixels = (lat: number, lng: number) => {
    // Map container dimensions - scaled 2x for panning
    const containerWidth = 430 * 2; // iPhone 16 Pro Max width * 2
    const containerHeight = 932 * 2; // scaled for panning
    
    // Convert to percentage position
    const latPercent = ((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat));
    const lngPercent = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng));
    
    // Invert latitude (higher lat = top of map)
    const top = (1 - latPercent) * containerHeight;
    const left = lngPercent * containerWidth;
    
    return { top, left };
  };

  // Convert distance units to pixel radius for the circular boundary
  const distanceToPixelRadius = (distance: number) => {
    // Approximate scale: 1 degree lat/lng ≈ containerHeight / (maxLat - minLat) pixels
    const containerHeight = 932 * 2;
    const latRange = mapBounds.maxLat - mapBounds.minLat;
    const pixelsPerDegree = containerHeight / latRange;
    return distance * pixelsPerDegree;
  };

  return (
    <div className="bg-white h-[932px] overflow-hidden relative">
      {/* Map Area - Full Screen with Panning */}
      <div 
        ref={mapContainerRef}
        className="absolute inset-0 bg-gray-200 overflow-hidden"
      >
        <div
          ref={mapRef}
          className="absolute cursor-grab active:cursor-grabbing map-background"
          style={{
            width: '200%',
            height: '200%',
            left: '-50%',
            top: '-50%',
            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoomLevel})`,
            transition: isMapDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onTouchStart={handleMapTouchStart}
          onTouchMove={handleMapTouchMove}
          onTouchEnd={handleMapTouchEnd}
          onMouseDown={handleMapMouseDown}
        >
          <ImageWithFallback
            src={mapBackground}
            alt="Map"
            className="w-full h-full object-cover opacity-60 pointer-events-none"
          />
          
          {/* Current User Location Marker - Blue pulse */}
          {(() => {
            const { top, left } = latLngToPixels(currentUser.lat, currentUser.lng);
            return (
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50"
                style={{ 
                  top: `${top}px`, 
                  left: `${left}px`,
                  transform: `translate(-50%, -50%) scale(${1 / zoomLevel})`
                }}
              >
                {/* Outer glow ring */}
                <div className="w-[50px] h-[50px] rounded-full bg-blue-400 opacity-40 flex items-center justify-center shadow-lg">
                  {/* Inner solid circle with white border */}
                  <div className="w-[32px] h-[32px] rounded-full bg-blue-600 flex items-center justify-center shadow-xl border-4 border-white">
                    {/* Center dot */}
                    <div className="w-[14px] h-[14px] rounded-full bg-white" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Friend Location Markers - Limited to 5 */}
          {mockFriends.slice(0, 5).map((friend) => {
            const { top, left } = latLngToPixels(friend.lat, friend.lng);
            const isSelected = selectedFriend?.id === friend.id;
            
            return (
              <div 
                key={friend.id}
                className="absolute"
                style={{ 
                  top: `${top}px`, 
                  left: `${left}px`,
                  transform: `translate(-50%, -50%) scale(${1 / zoomLevel})`,
                  transformOrigin: 'center'
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle selection - if same friend is clicked, deselect
                    setSelectedFriend(selectedFriend?.id === friend.id ? null : friend);
                    // Deselect event when selecting friend
                    setSelectedEvent(null);
                  }}
                  className={`w-[36px] h-[36px] rounded-full border-3 border-green-400 overflow-hidden shadow-lg transition-all hover:scale-110 ${
                    isSelected ? 'ring-4 ring-green-500' : ''
                  }`}
                  title={friend.name}
                >
                  <ImageWithFallback
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Friend Preview Box - Shows next to marker when selected */}
                {isSelected && (
                  <div 
                    className="absolute left-[50px] top-1/2 -translate-y-1/2 z-50 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onNavigate('friendProfile', undefined, { friendName: friend.name })}
                      className="bg-white rounded-xl shadow-2xl p-3 w-[140px] hover:shadow-3xl transition-shadow"
                    >
                      <div className="flex flex-col gap-2 items-center">
                        <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-green-400">
                          <ImageWithFallback
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-[13px] font-bold mb-1">{friend.name}</h3>
                          <p className="text-[10px] text-gray-600">View Profile</p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Midpoint Boundary Circle - Large transparent area containing suggested events */}
          {(() => {
            const { top, left } = latLngToPixels(midpoint.lat, midpoint.lng);
            const radiusInPixels = distanceToPixelRadius(midpointRadius);
            
            return (
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ 
                  top: `${top}px`, 
                  left: `${left}px`,
                  width: `${radiusInPixels * 2}px`,
                  height: `${radiusInPixels * 2}px`
                }}
              >
                {/* Outer boundary circle */}
                <div className="w-full h-full rounded-full border-4 border-purple-400 bg-purple-200/40" />
              </div>
            );
          })()}

          {/* All Event Markers */}
          {filteredEvents.map((event) => {
            const { top, left } = latLngToPixels(event.lat, event.lng);
            const isSuggested = suggestedEvents.some(e => e.id === event.id);
            const isSelected = selectedEvent?.id === event.id;
            
            return (
              <div 
                key={event.id} 
                className="absolute" 
                style={{ 
                  top: `${top}px`, 
                  left: `${left}px`,
                  transform: `translate(-50%, -50%) scale(${1 / zoomLevel})`,
                  transformOrigin: 'center'
                }}
              >
                {/* Event Marker Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle selection - if same event is clicked, deselect it
                    setSelectedEvent(selectedEvent?.id === event.id ? null : event);
                    // Deselect friend when selecting event
                    setSelectedFriend(null);
                  }}
                  className={`w-[32px] h-[32px] rounded-full overflow-hidden shadow-lg transition-all hover:scale-110 ${
                    isSelected ? 'ring-4 ring-blue-500' : ''
                  } ${
                    isSuggested ? 'border-3 border-yellow-400 w-[40px] h-[40px] z-10' : 'border-2 border-white'
                  }`}
                  title={event.name}
                >
                  <ImageWithFallback
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Event Preview Box - Shows next to marker when selected */}
                {isSelected && (
                  <div 
                    className="absolute left-[50px] top-1/2 -translate-y-1/2 z-50 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onNavigate('event', event.id)}
                      className="bg-white rounded-xl shadow-2xl p-2 w-[165px] hover:shadow-3xl transition-shadow"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="relative w-full h-[90px] rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={event.imageUrl}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Date overlay on image */}
                          {event.startDate && (
                            <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                              {event.endDate ? `${event.startDate} - ${event.endDate}` : event.startDate}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="text-[12px] font-bold mb-1 line-clamp-2">{event.name}</h3>
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                            <span className="text-[10px] text-gray-600">{event.rating}</span>
                            <span className="text-[10px] text-gray-400">({event.reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="text-[10px] text-gray-600 truncate">{event.city}, {event.state}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Search UI */}
      <div className="absolute top-0 left-0 right-0 px-[21px] pt-[59px] z-30"> {/* Added notch padding */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex-shrink-0 w-[40px] h-[40px] rounded-full bg-gray-300 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 bg-gray-300 rounded-[5px] px-4 py-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search for events..."
              className="w-full bg-transparent text-[11px] outline-none"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('All');
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-[5px] text-[11px] font-semibold transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            All
          </button>
          {categories.filter(cat => cat !== 'All' && cat !== 'Food & Drink').map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setSearchQuery(category);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-[5px] text-[11px] font-semibold transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Toggleable Map Legend - Lower Right - Fixed Position */}
      {sheetHeight < 700 && (
        <div 
          className="absolute right-[21px] z-30 flex flex-col gap-3"
          style={{ 
            bottom: `${sheetHeight + 20}px`
          }}
        >
          {/* Calibration Button */}
          <button
            onClick={handleCalibration}
            className="w-[48px] h-[48px] rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Center map to your location"
          >
            <Crosshair className="w-5 h-5 text-gray-700" />
          </button>

          {/* Legend Toggle */}
          {showLegend ? (
            <div className="bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-700">Map Legend</span>
                <button 
                  onClick={() => setShowLegend(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-[16px] h-[16px] rounded-full bg-blue-500 border-2 border-white flex-shrink-0" />
                  <span className="text-gray-700">You</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[16px] h-[16px] rounded-full bg-green-400 border-2 border-white flex-shrink-0" />
                  <span className="text-gray-700">Friends</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[16px] h-[16px] rounded-full border-2 border-purple-400 bg-purple-200/40 flex-shrink-0" />
                  <span className="text-gray-700">Midpoint</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[16px] h-[16px] rounded-full bg-gray-400 border-2 border-yellow-400 flex-shrink-0" />
                  <span className="text-gray-700">Suggested</span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLegend(true)}
              className="w-[48px] h-[48px] rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              title="Show map legend"
            >
              <CircleHelp className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      )}

      {/* Draggable Bottom Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-2xl transition-all z-20"
        style={{ 
          height: `${sheetHeight}px`,
          transition: isDragging ? 'none' : 'height 0.3s ease-out'
        }}
      >
        {/* Drag Handle */}
        <div
          className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-[40px] h-[5px] bg-gray-300 rounded-full" />
        </div>

        <div className="px-[20px] overflow-y-auto h-[calc(100%-40px)] pb-[100px]">
          {/* Suggested Events Section */}
          <div className="mb-6 bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-[16px] font-bold text-purple-900">Meet in the Middle</h3>
            </div>
            <p className="text-[12px] text-purple-700 mb-3">
              Events closest to you and your {mockFriends.length} friends
            </p>
            <div className="space-y-2">
              {suggestedEvents.map((event, index) => (
                <button
                  key={event.id}
                  onClick={() => onNavigate('event', event.id)}
                  className="w-full bg-white rounded-lg p-3 border border-purple-200 hover:border-purple-400 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[50px] h-[50px] rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white bg-yellow-500 rounded-full px-2 py-0.5">
                          #{index + 1}
                        </span>
                        <h4 className="text-[14px] font-semibold truncate">{event.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[11px] text-gray-600">{event.rating}</span>
                        <span className="text-[11px] text-gray-500">• {event.city}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* All Events List */}
          <div>
            <h3 className="text-[16px] font-semibold mb-3">
              {selectedCategory === 'All' ? 'Nearby Events' : `${selectedCategory} Events`}
            </h3>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onNavigate('event', event.id)}
                  className="w-full border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold mb-1">{event.name}</h3>
                      <div className="flex items-center gap-1 text-[12px] text-gray-500 mb-1">
                        <span>{event.city}, {event.state}</span>
                        <span className="mx-1">•</span>
                        <div className="flex items-center">
                          {Array.from({ length: event.pricePoint }, (_, i) => (
                            <DollarSign key={i} className="w-3 h-3" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4 text-right">
                      {event.startDate && (
                        <div className="text-[11px] text-gray-500 mb-1">
                          {event.endDate ? `${event.startDate} - ${event.endDate}` : event.startDate}
                        </div>
                      )}
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-[12px] text-gray-600">
                          {event.rating} ({event.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-[14px]">No events found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation 
        currentPage="explore"
        onNavigate={onNavigate}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />
      
      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
        onNavigateToExplore={handleNavigateFromSearch}
      />
    </div>
  );
}