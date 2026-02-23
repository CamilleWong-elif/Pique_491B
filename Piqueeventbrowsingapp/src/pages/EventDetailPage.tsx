import { ArrowLeft, Star, DollarSign, ChevronLeft, ChevronRight, Navigation, Bookmark } from 'lucide-react';
import { Event } from '../types/Event';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { useState, useEffect } from 'react';

interface EventDetailPageProps {
  event: Event;
  onBack: () => void;
  showPrice?: boolean;
  onNavigate?: (page: string, eventId?: string) => void;
  activeTab?: 'posted' | 'liked' | 'booked';
}

export function EventDetailPage({ event, onBack, showPrice = true, onNavigate, activeTab }: EventDetailPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [whiteBackdrop, setWhiteBackdrop] = useState(true);
  const [touchStart, setTouchStart] = useState(0);

  // Get all images (main image + user images)
  const allImages = [
    { url: event.imageUrl, userName: 'Event Creator' },
    ...(event.userImages || [])
  ];

  const formatDate = () => {
    if (!event.startDate) return '';
    if (event.endDate) {
      return `${event.startDate} - ${event.endDate}`;
    }
    return event.startDate;
  };

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    if (allImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % allImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [allImages.length]);

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setWhiteBackdrop(true);
  };

  const toggleBackdrop = () => {
    setWhiteBackdrop(!whiteBackdrop);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent default to avoid scrolling while swiping
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && currentImageIndex < allImages.length - 1) {
        nextImage();
      } else if (diff < 0 && currentImageIndex > 0) {
        previousImage();
      }
    }
  };

  const renderPricePoints = () => {
    return Array.from({ length: 4 }, (_, i) => (
      <span 
        key={i}
        className={i < event.pricePoint ? 'text-black' : 'text-gray-300'}
      >
        $
      </span>
    ));
  };

  const reviews = [
    {
      id: 1,
      author: 'Sarah M.',
      rating: 5,
      comment: 'Amazing experience! The staff was friendly and the facility was clean.',
      date: '2 days ago'
    },
    {
      id: 2,
      author: 'Mike R.',
      rating: 4,
      comment: 'Great place, would definitely recommend to friends.',
      date: '1 week ago'
    },
    {
      id: 3,
      author: 'Emma L.',
      rating: 5,
      comment: 'Had such a fun time! Perfect for a weekend activity.',
      date: '2 weeks ago'
    },
    {
      id: 4,
      author: 'John D.',
      rating: 4,
      comment: 'Really enjoyed it. Will come back again!',
      date: '3 weeks ago'
    }
  ];

  const handleBookClick = () => {
    // Navigate to payment page
    if (onNavigate) {
      onNavigate('payment', event.id);
    }
  };

  // Only show Book Now button for liked events or when no activeTab is specified (homepage/explore)
  // Hide for posted and booked events
  const showBookButton = !activeTab || activeTab === 'liked';

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden">
      {/* Gallery Overlay */}
      {galleryOpen && (
        <div 
          className={`fixed inset-0 z-[100] flex flex-col transition-colors ${
            whiteBackdrop ? 'bg-white' : 'bg-black'
          }`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 pt-[59px] pb-3 relative z-10"> {/* Added notch padding */}
            <button
              onClick={closeGallery}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                whiteBackdrop ? 'hover:bg-gray-100' : 'hover:bg-white/10'
              }`}
            >
              <ChevronLeft className={`w-7 h-7 ${whiteBackdrop ? 'text-gray-900' : 'text-white'}`} />
            </button>
            
            {whiteBackdrop && (
              <h1 className="text-[17px] font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">
                {event.name}
              </h1>
            )}

            <button
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                whiteBackdrop ? 'hover:bg-gray-100' : 'hover:bg-white/10'
              }`}
            >
              <span className={`text-2xl ${whiteBackdrop ? 'text-gray-900' : 'text-white'}`}>⋯</span>
            </button>
          </div>

          {/* Image Container */}
          <div 
            onClick={toggleBackdrop}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex-1 flex items-center justify-center relative cursor-pointer"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {/* Image Counter */}
            {!whiteBackdrop && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-10">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Previous Button */}
            {currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousImage();
                }}
                className={`absolute left-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10 ${
                  whiteBackdrop 
                    ? 'bg-gray-200 hover:bg-gray-300' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <ChevronLeft className={`w-8 h-8 ${whiteBackdrop ? 'text-gray-900' : 'text-white'}`} />
              </button>
            )}

            <div className="w-full h-full flex items-center justify-center">
              <ImageWithFallback
                src={allImages[currentImageIndex].url}
                alt={`Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Next Button */}
            {currentImageIndex < allImages.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className={`absolute right-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10 ${
                  whiteBackdrop 
                    ? 'bg-gray-200 hover:bg-gray-300' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <ChevronRight className={`w-8 h-8 ${whiteBackdrop ? 'text-gray-900' : 'text-white'}`} />
              </button>
            )}
          </div>

          {/* Bottom Info */}
          {whiteBackdrop && (
            <div className="px-6 pb-6 pt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {allImages[currentImageIndex].userName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[15px]">{allImages[currentImageIndex].userName}</p>
                  <p className="text-gray-600 text-[13px]">Posted to {event.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hero Image Slideshow */}
      <div className="relative h-[240px] bg-[rgba(217,217,217,0.66)]">
        <div 
          onClick={() => openGallery(currentSlide)}
          className="w-full h-full cursor-pointer"
        >
          <ImageWithFallback
            src={allImages[currentSlide].url}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Slide Indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-6 bg-white' 
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-[46px] left-[27px] w-[40px] h-[40px] rounded-full bg-gray-300 flex items-center justify-center shadow-md z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Event Info */}
      <div className="px-[26px] py-6 pb-[120px]">
        <div className="flex items-baseline gap-3 mb-3">
          <h1 className="text-[20px] font-bold">{event.name}</h1>
          {event.startDate && (
            <span className="text-[14px] text-gray-500 font-medium">
              {formatDate()}
            </span>
          )}
        </div>
        
        {/* Location and Rating */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] opacity-50">
            {event.city}, {event.state}
          </p>
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-[14px] font-semibold">{event.rating}</span>
            <span className="text-[12px] text-gray-600 ml-1">({event.reviewCount})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => onNavigate?.('review', event.id)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Star className="w-4 h-4" />
            <span className="text-[14px] font-medium">Review</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Navigation className="w-4 h-4" />
            <span className="text-[14px] font-medium">Directions</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Bookmark className="w-4 h-4" />
            <span className="text-[14px] font-medium">Bookmark</span>
          </button>
        </div>

        {/* Reviews Section */}
        <div className="space-y-8">
          <div>
            <h2 className="text-[16px] font-semibold mb-3">Reviews</h2>
            <div className="border-t border-black mb-3" />
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-100 rounded-[2px] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[14px]">{review.author}</span>
                    <div className="flex items-center">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-700 mb-1">{review.comment}</p>
                  <p className="text-[11px] text-gray-500">{review.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[16px] font-semibold mb-2">Description</h2>
            <div className="border-t border-black mb-3" />
            <p className="text-[14px] text-gray-700">{event.description}</p>
          </div>

          <div>
            <h2 className="text-[16px] font-semibold mb-2">Location</h2>
            <div className="border-t border-black mb-3" />
            <p className="text-[14px] text-gray-700">
              {event.address}<br />
              {event.city}, {event.state}
            </p>
            <p className="text-[13px] text-gray-600 mt-1">{event.distance} miles away</p>
          </div>
        </div>

        <div className="h-[1px] bg-black opacity-15 my-6" />

        {/* Pricing */}
        {showPrice && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 mr-2" />
              <span className="text-[20px] font-semibold">{renderPricePoints()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Book Button */}
      {showBookButton && (
        <div className="fixed bottom-[30px] left-0 right-0 flex justify-center px-[26px] pointer-events-none z-40">
          <Button
            onClick={handleBookClick}
            className="pointer-events-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-12 rounded-full shadow-lg text-[16px] transition-all active:scale-95 w-full max-w-[380px]"
          >
            Book Now
          </Button>
        </div>
      )}
    </div>
  );
}