import { useState } from 'react';
import { X, ArrowLeft, Send, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { Conversation, Message } from '../types/Message';
import { mockConversations, mockEvents, mockPosts } from '../data/mockData';
import { Event } from '../types/Event';
import { BottomNavigation } from './BottomNavigation';
import { ChatSettingsModal } from './ChatSettingsModal';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onNavigate: (page: string, eventId?: string, options?: { showPrice?: boolean; friendName?: string; fromMessages?: boolean }) => void;
  unreadMessageCount?: number;
}

export function MessagingModal({ isOpen, onClose, onBack, onNavigate, unreadMessageCount }: MessagingModalProps) {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [muteEndTime, setMuteEndTime] = useState<Date | null>(null);
  const [chatTheme, setChatTheme] = useState<string>('default');
  const [isShiftActive, setIsShiftActive] = useState(false);

  if (!isOpen) return null;

  const handleToggleMute = (duration?: number) => {
    if (isMuted) {
      setIsMuted(false);
      setMuteEndTime(null);
    } else if (duration) {
      setIsMuted(true);
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + duration);
      setMuteEndTime(endTime);
    } else {
      // Mute indefinitely
      setIsMuted(true);
      setMuteEndTime(null);
    }
    setIsSettingsModalOpen(false);
  };

  const handleToggleBlock = () => {
    setIsBlocked(!isBlocked);
    setIsSettingsModalOpen(false);
  };

  const handleDeleteChat = () => {
    // In a real app, this would delete the conversation
    setIsSettingsModalOpen(false);
    setSelectedConversation(null);
  };

  const handleReport = () => {
    // In a real app, this would open a report dialog
    setIsSettingsModalOpen(false);
    alert('Report functionality would be implemented here');
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    // In a real app, this would send the message with reply data if replyingTo is set
    setMessageText('');
    setReplyingTo(null);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setShowShareMenu(false);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleShareEvent = (event: Event) => {
    if (!selectedConversation) return;
    
    // In a real app, this would send the shared event
    setShowShareMenu(false);
  };

  const handleSharePost = (post: typeof mockPosts[0]) => {
    if (!selectedConversation) return;
    
    // In a real app, this would send the shared post
    setShowShareMenu(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Get theme colors
  const getThemeColors = () => {
    const themes: Record<string, { sent: string; received: string; bg: string; text: string }> = {
      default: { sent: 'bg-blue-500', received: 'bg-white', bg: 'bg-gray-50', text: 'text-white' },
      purple: { sent: 'bg-purple-500', received: 'bg-white', bg: 'bg-purple-50', text: 'text-white' },
      green: { sent: 'bg-green-500', received: 'bg-white', bg: 'bg-green-50', text: 'text-white' },
      pink: { sent: 'bg-pink-500', received: 'bg-white', bg: 'bg-pink-50', text: 'text-white' },
      orange: { sent: 'bg-orange-500', received: 'bg-white', bg: 'bg-orange-50', text: 'text-white' },
      dark: { sent: 'bg-gray-800', received: 'bg-gray-700', bg: 'bg-gray-900', text: 'text-white' },
    };
    return themes[chatTheme] || themes.default;
  };

  const themeColors = getThemeColors();

  // Handle navigation from bottom nav - need to close modal when navigating away from messages
  const handleNavigation = (page: string) => {
    if (page !== 'messages') {
      onClose();
    }
    onNavigate(page);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[430px] h-[932px] bg-white flex flex-col relative">
        {/* Header */}
        {!selectedConversation ? (
          <div className="flex items-center gap-3 px-4 py-4 pt-12 border-b border-gray-200">{/* Added pt-12 for top safe area */}
            {/* Back Button */}
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-xl">Messages</h2>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-4 pt-12 border-b border-gray-200">{/* Added pt-12 for top safe area */}
            <button
              onClick={() => setSelectedConversation(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={selectedConversation.friendAvatar}
              alt={selectedConversation.friendName}
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={() => {
                onClose();
                onNavigate('friendProfile', undefined, { friendName: selectedConversation.friendName, fromMessages: true });
              }}
            />
            <button 
              onClick={() => {
                onClose();
                onNavigate('friendProfile', undefined, { friendName: selectedConversation.friendName, fromMessages: true });
              }}
              className="text-lg hover:underline flex-1 text-left"
            >
              {selectedConversation.friendName}
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}

        {/* Content */}
        {!selectedConversation ? (
          // Conversations List
          <>
            <div className="flex-1 overflow-y-auto pb-[80px]">{/* Increased padding for bottom nav */}
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => {
                      onClose();
                      onNavigate('friendProfile', undefined, { friendName: conv.friendName, fromMessages: true });
                    }}
                  >
                    <img
                      src={conv.friendAvatar}
                      alt={conv.friendName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left cursor-pointer" onClick={() => setSelectedConversation(conv)}>
                    <div className="flex items-center justify-between mb-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onNavigate('friendProfile', undefined, { friendName: conv.friendName, fromMessages: true });
                        }}
                        className={`hover:underline ${conv.unreadCount > 0 ? 'font-semibold' : ''}`}
                      >
                        {conv.friendName}
                      </button>
                      <span className="text-xs text-gray-500">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className={`text-sm text-gray-600 truncate ${conv.unreadCount > 0 ? 'font-medium' : ''}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Navigation - Only shown in conversations list */}
            <div className="absolute bottom-0 left-0 right-0">
              <BottomNavigation
                currentPage="home"
                onNavigate={handleNavigation}
                onOpenMessages={() => {}}
                unreadMessageCount={unreadMessageCount}
              />
            </div>
          </>
        ) : (
          // Chat View
          <>
            <div className={`flex-1 overflow-y-auto px-4 py-4 ${themeColors.bg} pb-[160px]`}>{/* Applied theme background */}
              {selectedConversation.messages.map((message) => {
                const isCurrentUser = message.senderId === 'current';
                return (
                  <div
                    key={message.id}
                    className={`group flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col gap-1 relative`}>
                      {/* Reply indicator - shows if this message is a reply */}
                      {message.replyTo && (
                        <div className={`px-3 py-1.5 rounded-lg text-xs mb-1 border-l-2 ${
                          isCurrentUser 
                            ? 'bg-blue-100 border-blue-400 text-blue-800' 
                            : chatTheme === 'dark' ? 'bg-gray-600 border-gray-400 text-gray-200' : 'bg-gray-100 border-gray-400 text-gray-700'
                        }`}>
                          <p className="font-medium">{message.replyTo.senderName}</p>
                          <p className="truncate opacity-80">{message.replyTo.text || 'Shared content'}</p>
                        </div>
                      )}
                      
                      {/* Reply button - appears on hover */}
                      <button
                        onClick={() => handleReply(message)}
                        className={`absolute top-0 ${isCurrentUser ? 'left-0 -translate-x-8' : 'right-0 translate-x-8'} opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-200 rounded-full text-gray-600`}
                        title="Reply"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      
                      {message.text && (
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? `${themeColors.sent} ${themeColors.text} rounded-br-md`
                              : `${themeColors.received} ${chatTheme === 'dark' ? 'text-white' : 'text-gray-900'} rounded-bl-md`
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      )}
                      {message.sharedEvent && (
                        <div
                          onClick={() => {
                            if (message.sharedEvent) {
                              setSelectedEvent(message.sharedEvent);
                            }
                          }}
                          className={`border-2 ${isCurrentUser ? 'border-blue-500' : 'border-gray-300'} rounded-lg overflow-hidden bg-white cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                          <div className="relative">
                            <img
                              src={message.sharedEvent.imageUrl}
                              alt={message.sharedEvent.name}
                              className="w-full h-32 object-cover"
                            />
                            {/* Date overlay on image */}
                            {message.sharedEvent.startDate && (
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded">
                                {message.sharedEvent.endDate 
                                  ? `${message.sharedEvent.startDate} - ${message.sharedEvent.endDate}` 
                                  : message.sharedEvent.startDate}
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="font-medium text-sm">{message.sharedEvent.name}</p>
                            <p className="text-xs text-gray-600">
                              {message.sharedEvent.city}, {message.sharedEvent.state}
                            </p>
                          </div>
                        </div>
                      )}
                      {message.sharedPost && (
                        <div
                          className={`border-2 ${isCurrentUser ? 'border-blue-500' : 'border-gray-300'} rounded-lg overflow-hidden bg-white`}
                        >
                          <img
                            src={message.sharedPost.imageUrl}
                            alt="Shared post"
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={message.sharedPost.userAvatar}
                                alt={message.sharedPost.userName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <p className="font-medium text-sm">{message.sharedPost.userName}</p>
                            </div>
                            {message.sharedPost.caption && (
                              <p className="text-xs text-gray-600">{message.sharedPost.caption}</p>
                            )}
                          </div>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 px-2">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Share Menu */}
            {showShareMenu && (
              <div 
                className={`absolute left-0 right-0 border border-gray-200 bg-white max-h-[300px] overflow-y-auto z-10 transition-all duration-200 mx-4 rounded-2xl shadow-xl ${
                  isInputFocused ? 'bottom-[440px]' : 'bottom-[180px]'
                }`}
              >{/* Positioned above chatbox with gap */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-medium mb-3">Share Events</h3>
                  <div className="space-y-2">
                    {mockEvents.slice(0, 5).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleShareEvent(event)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm">{event.name}</p>
                          <p className="text-xs text-gray-600">
                            {event.city}, {event.state}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <h3 className="font-medium mb-3">Share Posts</h3>
                  <div className="space-y-2">
                    {mockPosts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handleSharePost(post)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm">{post.userName}</p>
                          <p className="text-xs text-gray-600 truncate">{post.caption}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div 
              className={`absolute left-0 right-0 border-t border-gray-200 bg-white shadow-xl transition-all duration-200 ${
                isInputFocused ? 'bottom-[280px]' : 'bottom-16'
              }`}
            >{/* Moves up when keyboard is open */}
              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-4 pt-3 pb-2 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 mb-0.5">
                        Replying to {replyingTo.senderId === 'current' ? 'yourself' : selectedConversation?.friendName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {replyingTo.text || 'Shared content'}
                      </p>
                    </div>
                    <button
                      onClick={cancelReply}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className={`p-2 rounded-full transition-colors ${
                      showShareMenu ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={replyingTo ? "Type a reply..." : "Type a message..."}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={(e) => {
                      // Only blur if not clicking keyboard
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      if (!relatedTarget || !relatedTarget.closest('.keyboard-container')) {
                        setIsInputFocused(false);
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className={`p-2 rounded-full transition-colors ${
                      messageText.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* iOS Keyboard */}
            {isInputFocused && (
              <div className="keyboard-container absolute bottom-0 left-0 right-0 bg-[#D1D5DB]">
                {/* Keyboard Layout */}
                <div className="px-1 pt-1 pb-1">
                  {/* First Row */}
                  <div className="flex gap-[6px] mb-2 justify-center">
                    {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
                      <button
                        key={key}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setMessageText(prev => prev + (isShiftActive ? key : key.toLowerCase()));
                          setIsShiftActive(false);
                        }}
                        className="flex-1 h-[42px] bg-white rounded shadow-sm text-base font-normal"
                      >
                        {isShiftActive ? key : key.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  {/* Second Row */}
                  <div className="flex gap-[6px] mb-2 justify-center px-4">
                    {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
                      <button
                        key={key}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setMessageText(prev => prev + (isShiftActive ? key : key.toLowerCase()));
                          setIsShiftActive(false);
                        }}
                        className="flex-1 h-[42px] bg-white rounded shadow-sm text-base font-normal"
                      >
                        {isShiftActive ? key : key.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  {/* Third Row */}
                  <div className="flex gap-[6px] mb-2">
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsShiftActive(!isShiftActive);
                      }}
                      className={`flex-1 h-[42px] rounded shadow-sm flex items-center justify-center ${
                        isShiftActive ? 'bg-blue-400' : 'bg-[#ABB3BD]'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3l6 9H4l6-9z" />
                      </svg>
                    </button>
                    {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                      <button
                        key={key}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setMessageText(prev => prev + (isShiftActive ? key : key.toLowerCase()));
                          setIsShiftActive(false);
                        }}
                        className="flex-1 h-[42px] bg-white rounded shadow-sm text-base font-normal"
                      >
                        {isShiftActive ? key : key.toLowerCase()}
                      </button>
                    ))}
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setMessageText(prev => prev.slice(0, -1));
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
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      123
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setMessageText(prev => prev + ' ');
                      }}
                      className="flex-1 h-[42px] bg-white rounded shadow-sm text-sm"
                    >
                      space
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                        setIsInputFocused(false);
                      }}
                      className="w-[70px] h-[42px] bg-blue-500 rounded shadow-sm text-white text-sm font-semibold"
                    >
                      send
                    </button>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="flex justify-center py-2">
                  <div className="w-[134px] h-[5px] bg-black rounded-full" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {isSettingsModalOpen && selectedConversation && (
        <ChatSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          friendName={selectedConversation.friendName}
          friendAvatar={selectedConversation.friendAvatar}
          isMuted={isMuted}
          isBlocked={isBlocked}
          muteEndTime={muteEndTime}
          chatTheme={chatTheme}
          onToggleMute={handleToggleMute}
          onToggleBlock={handleToggleBlock}
          onDeleteChat={handleDeleteChat}
          onReport={handleReport}
          onChangeTheme={setChatTheme}
        />
      )}
    </div>
  );
}