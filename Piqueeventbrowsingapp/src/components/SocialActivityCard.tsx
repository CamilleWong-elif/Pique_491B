import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, X, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { SocialActivity } from '../types/Event';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SocialActivityCardProps {
  activity: SocialActivity;
  onClick: () => void;
  onFriendClick?: (friendName: string) => void;
}

export function SocialActivityCard({ activity, onClick, onFriendClick }: SocialActivityCardProps) {
  const [isLiked, setIsLiked] = useState(activity.isLiked || false);
  const [isSaved, setIsSaved] = useState(activity.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [localLikes, setLocalLikes] = useState(activity.likes);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [whiteBackdrop, setWhiteBackdrop] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLocalLikes(isLiked ? localLikes - 1 : localLikes + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handlePostComment = () => {
    if (commentText.trim()) {
      // In a real app, this would post the comment to a backend
      console.log('Posting comment:', commentText);
      setCommentText('');
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const handlePostReply = (commentId: string) => {
    if (replyText.trim()) {
      // In a real app, this would post the reply to a backend
      console.log('Posting reply to comment', commentId, ':', replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setWhiteBackdrop(true); // Reset to white when closing
  };

  const toggleBackdrop = () => {
    setWhiteBackdrop(!whiteBackdrop);
  };

  const nextImage = () => {
    if (activity.reviewImages && currentImageIndex < activity.reviewImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && activity.reviewImages && currentImageIndex < activity.reviewImages.length - 1) {
      nextImage();
    }
    
    if (isRightSwipe && currentImageIndex > 0) {
      previousImage();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const renderActionText = () => {
    if (activity.action === 'going') {
      return (
        <p className="text-[14px] leading-snug">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFriendClick?.(activity.userName);
            }}
            className="font-semibold hover:underline"
          >
            {activity.userName}
          </button>
          <span> is going to </span>
          <button 
            onClick={onClick}
            className="font-bold hover:underline"
          >
            {activity.eventName}
          </button>
        </p>
      );
    } else if (activity.action === 'interested') {
      return (
        <p className="text-[14px] leading-snug">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFriendClick?.(activity.userName);
            }}
            className="font-semibold hover:underline"
          >
            {activity.userName}
          </button>
          <span> is interested in </span>
          <button 
            onClick={onClick}
            className="font-bold hover:underline"
          >
            {activity.eventName}
          </button>
        </p>
      );
    } else if (activity.action === 'rated') {
      return (
        <div>
          <p className="text-[14px] leading-snug mb-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFriendClick?.(activity.userName);
              }}
              className="font-semibold hover:underline"
            >
              {activity.userName}
            </button>
            <span> ranked </span>
            <button 
              onClick={onClick}
              className="font-bold hover:underline"
            >
              {activity.eventName}
            </button>
          </p>
          {activity.eventLocation && (
            <p className="text-[12px] text-gray-600 mb-1">📍 {activity.eventLocation}</p>
          )}
        </div>
      );
    }
  };

  const renderInteractionButtons = () => (
    <div className="mt-3">
      {/* Action Buttons */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className="flex items-center gap-1 transition-colors"
          >
            <Heart 
              className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
            />
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            className="flex items-center gap-1 transition-colors"
          >
            <Bookmark 
              className={`w-6 h-6 ${isSaved ? 'fill-gray-700 text-gray-700' : 'text-gray-700'}`}
            />
          </button>
        </div>
      </div>

      {/* Likes and Comments Count */}
      <button 
        onClick={() => setShowComments(!showComments)}
        className="text-[12px] text-gray-600 mt-2 px-1 hover:text-gray-900 transition-colors"
      >
        {localLikes} {localLikes === 1 ? 'like' : 'likes'}, {activity.comments.length} {activity.comments.length === 1 ? 'comment' : 'comments'}
      </button>

      {/* Comments Section */}
      {showComments && activity.comments.length > 0 && (
        <div className="mt-3 border-t border-gray-200 pt-3 space-y-3">
          {activity.comments.map((comment) => (
            <div key={comment.id}>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFriendClick?.(comment.userName);
                  }}
                >
                  <ImageWithFallback
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[13px]">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onFriendClick?.(comment.userName);
                      }}
                      className="font-semibold hover:underline"
                    >
                      {comment.userName}
                    </button>
                    <span className="text-gray-700 ml-2">{comment.text}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-[11px] text-gray-500">
                      {formatTimestamp(comment.timestamp)}
                    </p>
                    <button
                      onClick={() => handleReply(comment.id)}
                      className="text-[11px] text-gray-600 font-semibold hover:text-gray-900"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-2 ml-10 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={activity.userAvatar}
                      alt="You"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.userName}...`}
                    className="flex-1 px-3 py-1.5 text-[12px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handlePostReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelReply}
                    className="text-[11px] text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      {showComments && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer">
              <ImageWithFallback
                src={activity.userAvatar}
                alt={activity.userName}
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-1.5 text-[12px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handlePostComment}
              disabled={!commentText.trim()}
              className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays}d ago`;
  };

  // Rating card for rated activities
  if (activity.action === 'rated') {
    return (
      <>
        {/* Gallery Overlay */}
        {galleryOpen && activity.reviewImages && (
          <div 
            className={`fixed inset-0 z-[100] flex flex-col transition-colors ${
              whiteBackdrop ? 'bg-white' : 'bg-black'
            }`}
          >
            {/* Top Bar - Always visible */}
            <div className="flex items-center justify-between px-4 pt-3 pb-3 relative z-10">
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
                  {activity.eventName}
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

            {/* Image Container - Tappable to toggle backdrop */}
            <div 
              onClick={toggleBackdrop}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex-1 flex items-center justify-center relative cursor-pointer"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              {/* Image Counter - Only show on black backdrop */}
              {!whiteBackdrop && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-10">
                  {currentImageIndex + 1} / {activity.reviewImages.length}
                </div>
              )}

              {/* Previous Button - Show in both white and black backdrop */}
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
                  src={activity.reviewImages[currentImageIndex]}
                  alt={`Review image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Next Button - Show in both white and black backdrop */}
              {currentImageIndex < activity.reviewImages.length - 1 && (
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

            {/* Bottom Info - Only show on white backdrop */}
            {whiteBackdrop && (
              <div className="px-6 pb-6 pt-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {activity.userName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[15px] text-gray-900">{activity.userName}</p>
                    <p className="text-[13px] text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Caption/Review Text */}
                {activity.reviewText && (
                  <p className="text-[15px] text-gray-900 leading-relaxed">
                    {activity.reviewText}
                  </p>
                )}

                {/* Navigation Dots for multiple images */}
                {activity.reviewImages.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-4">
                    {activity.reviewImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-6 bg-white border-b border-gray-100 pb-6">
          {/* Header with user info */}
          <div className="flex items-start mb-3">
            <div 
              className="w-[50px] h-[50px] rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onFriendClick?.(activity.userName);
              }}
            >
              <ImageWithFallback
                src={activity.userAvatar}
                alt={activity.userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-3 flex-1">
              {renderActionText()}
            </div>
            {activity.rating && (
              <div className={`w-[45px] h-[45px] rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                activity.rating >= 4 
                  ? ((activity.rating - 4) / 1) * 100 > 66 
                    ? 'bg-green-100 border-green-500' 
                    : ((activity.rating - 4) / 1) * 100 > 33 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-green-50 border-green-300'
                  : activity.rating >= 2
                    ? 'bg-yellow-100 border-yellow-400'
                    : (activity.rating / 2) * 100 < 33
                      ? 'bg-red-100 border-red-500'
                      : (activity.rating / 2) * 100 < 66
                        ? 'bg-red-50 border-red-400'
                        : 'bg-red-50 border-red-300'
              }`}>
                <span className={`text-[16px] font-bold ${
                  activity.rating >= 4 
                    ? ((activity.rating - 4) / 1) * 100 > 66 
                      ? 'text-green-800' 
                      : ((activity.rating - 4) / 1) * 100 > 33 
                        ? 'text-green-700' 
                        : 'text-green-600'
                    : activity.rating >= 2
                      ? 'text-yellow-700'
                      : (activity.rating / 2) * 100 < 33
                        ? 'text-red-800'
                        : (activity.rating / 2) * 100 < 66
                          ? 'text-red-700'
                          : 'text-red-600'
                }`}>{activity.rating}</span>
              </div>
            )}
          </div>

          {/* Review Images */}
          {activity.reviewImages && activity.reviewImages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {activity.reviewImages.map((image, index) => (
                <div 
                  key={index}
                  onClick={() => openGallery(index)}
                  className="w-[150px] h-[150px] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <ImageWithFallback
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Review Text */}
          {activity.reviewText && (
            <div className="mt-3">
              <p className="text-[13px] text-gray-800 leading-relaxed">
                <span className="font-bold">Notes: </span>
                {activity.reviewText}
              </p>
            </div>
          )}

          {/* Interaction Buttons */}
          {renderInteractionButtons()}
        </div>
      </>
    );
  }

  // Simple card for going/interested activities
  return (
    <div className="mb-6 bg-white pb-4 border-b border-gray-100">
      <div className="flex items-center mb-2">
        <div 
          className="w-[35px] h-[35px] rounded-full bg-gray-200 overflow-hidden cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onFriendClick?.(activity.userName);
          }}
        >
          <ImageWithFallback
            src={activity.userAvatar}
            alt={activity.userName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-3">
          {renderActionText()}
        </div>
      </div>

      {/* Interaction Buttons */}
      {renderInteractionButtons()}
    </div>
  );
}