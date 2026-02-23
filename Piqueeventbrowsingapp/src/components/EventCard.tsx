import { Star, Bookmark, Navigation } from 'lucide-react';
import { Event } from '../types/Event';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventCardProps {
  event: Event;
  onClick: () => void;
  hideBookmark?: boolean;
}

export function EventCard({ event, onClick, hideBookmark = false }: EventCardProps) {
  const renderPricePoints = (pricePoint: number) => {
    return Array.from({ length: pricePoint }, () => '$').join('');
  };

  const formatDate = () => {
    if (!event.startDate) return '';
    if (event.endDate) {
      return `${event.startDate} - ${event.endDate}`;
    }
    return event.startDate;
  };

  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-full rounded-[8px] overflow-hidden cursor-pointer bg-white shadow-sm"
    >
      <div className="relative h-[120px] bg-gray-300">
        <ImageWithFallback
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        {/* Date overlay on image - bottom left */}
        {event.startDate && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded">
            {formatDate()}
          </div>
        )}
      </div>
      <div className="p-3 border border-gray-200 border-t-0 rounded-b-[8px]">
        <div className="flex items-start justify-between gap-2">
          {/* Left side: Name, Budget, City */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[13px] truncate mb-1">{event.name}</h3>
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <span className="text-[11px] text-green-600 font-semibold flex-shrink-0">{renderPricePoints(event.pricePoint)}</span>
              <span className="text-[11px] text-gray-400 flex-shrink-0">•</span>
              <span className="text-[11px] text-gray-600 truncate">{event.category}</span>
            </div>
            <p className="text-[10px] text-gray-500 truncate">{event.city}</p>
          </div>
          
          {/* Right side: Bookmark and Distance */}
          <div className="flex flex-col items-end justify-start gap-1">
            {!hideBookmark && (
              <button 
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle bookmark action
                }}
              >
                <Bookmark className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] text-gray-700 font-semibold">{event.rating}</span>
            </div>
            <div className="flex items-center justify-end h-[14px]">
              <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap">{event.distance} mi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}