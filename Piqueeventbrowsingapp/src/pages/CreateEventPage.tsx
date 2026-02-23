import { useState } from 'react';
import { Star, Upload, X, Plus, Ticket, Pencil } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';

interface CreateEventPageProps {
  onNavigate: (page: string, eventId?: string, options?: { showPrice?: boolean }) => void;
  onOpenMessages?: () => void;
  unreadMessageCount?: number;
  onEventCreated?: () => void;
}

interface TicketTier {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

export function CreateEventPage({ onNavigate, onOpenMessages, unreadMessageCount, onEventCreated }: CreateEventPageProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [whatIAte, setWhatIAte] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState('Any');
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    { id: '1', name: 'General Admission', price: '', quantity: '' }
  ]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketTier | null>(null);

  const availableCategories = [
    'Music',
    'Art',
    'Sports',
    'Outdoor',
    'Fitness',
    'Nightlife',
    'Workshop',
    'Entertainment',
    'Gaming',
    'Social',
    'Wellness',
    'Adventure',
    'Culture',
    'Educational',
    'Creative',
    'Theater',
    'Dance',
    'Comedy',
    'Food & Drink',
    'Tech',
  ];

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const remainingSlots = 10 - images.length;
      const filesToProcess = Math.min(files.length, remainingSlots);

      let processed = 0;
      for (let i = 0; i < filesToProcess; i++) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          processed++;
          if (processed === filesToProcess) {
            setImages([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addTicketTier = () => {
    const newId = (ticketTiers.length + 1).toString();
    setTicketTiers([...ticketTiers, { id: newId, name: `Tier ${newId}`, price: '', quantity: '' }]);
  };

  const updateTicketTier = (id: string, field: 'name' | 'price' | 'quantity', value: string) => {
    setTicketTiers(ticketTiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
    // Also update editingTicket if it's currently being edited
    if (editingTicket && editingTicket.id === id) {
      setEditingTicket({ ...editingTicket, [field]: value });
    }
  };

  const deleteTicketTier = (id: string) => {
    setTicketTiers(ticketTiers.filter(tier => tier.id !== id));
  };

  const startEditingTicket = (ticket: TicketTier) => {
    setEditingTicket(ticket);
    setShowTicketModal(true);
  };

  const saveEditedTicket = () => {
    if (editingTicket) {
      setTicketTiers(ticketTiers.map(tier => 
        tier.id === editingTicket.id ? { ...editingTicket } : tier
      ));
      setEditingTicket(null);
      setShowTicketModal(false);
    }
  };

  const handlePostEvent = () => {
    // Here you would typically send the event data to your backend
    if (onEventCreated) {
      onEventCreated();
    }
  };

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden scrollbar-hide">
      {/* Header */}
      <div className="bg-[#2C2C2C] text-white px-[18px] py-4 pt-[59px] flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-[16px] font-semibold">Create Event</h1>
        <button className="text-white text-[14px] font-semibold hover:opacity-80 transition-opacity" onClick={handlePostEvent}>Post</button>
      </div>

      <div className="px-[24px] pb-[120px]">
        {/* Image Upload Section */}
        <div className="mt-6 mb-6">
          <label className="block text-[12px] text-gray-500 font-semibold mb-3 uppercase tracking-wide">
            Event Photos ({images.length}/10)
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Display uploaded images */}
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 shadow-sm">
                <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black/90 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            
            {/* Add photo button - only show if less than 10 photos */}
            {images.length < 10 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#2C2C2C] hover:bg-gray-50 transition-all">
                <Upload className="w-7 h-7 text-gray-400" />
                <span className="text-[10px] text-gray-500 mt-1.5 font-medium">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Event Name and Age Range */}
        <div className="mb-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] text-gray-500 font-semibold uppercase tracking-wide">Event Name</label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">For:</span>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1 text-[12px] outline-none bg-white text-gray-700 font-medium shadow-sm"
              >
                <option value="Any">Any</option>
                <option value="Under 18">Under 18</option>
                <option value="18+">18+</option>
                <option value="21+">21+</option>
              </select>
            </div>
          </div>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Enter event name..."
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#2C2C2C] transition-colors"
          />
        </div>

        {/* Date and Max Capacity Row */}
        <div className="flex gap-3 mb-6">
          <div className="flex-[2] bg-gray-50 rounded-xl p-4">
            <label className="block text-[11px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#2C2C2C] transition-colors"
            />
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-4">
            <label className="block text-[11px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">Max Attendees</label>
            <input
              type="text"
              value={maxCapacity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^[0-9]*$/.test(value)) {
                  setMaxCapacity(value);
                }
              }}
              placeholder="∞"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#2C2C2C] transition-colors text-center"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] text-gray-500 font-semibold uppercase tracking-wide">Description</label>
            <span className="text-[11px] text-gray-400 font-medium">{description.length}/500</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setDescription(e.target.value);
              }
            }}
            placeholder="Describe your event..."
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none resize-none focus:border-[#2C2C2C] transition-colors"
          />
        </div>

        {/* Location */}
        <div className="mb-6 bg-gray-50 rounded-xl p-4">
          <label className="block text-[12px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter venue or address..."
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#2C2C2C] transition-colors"
          />
        </div>

        {/* Category */}
        <div className="mb-8 bg-gray-50 rounded-xl p-4">
          <label className="block text-[12px] text-gray-500 font-semibold mb-3 uppercase tracking-wide">
            Categories ({selectedCategories.length}/3)
          </label>
          
          {/* Selected Categories Display */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCategories.map((category) => (
                <div
                  key={category}
                  className="bg-[#2C2C2C] text-white px-3 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 shadow-sm"
                >
                  {category}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Category Button */}
          <button
            onClick={() => setShowCategoryModal(true)}
            disabled={selectedCategories.length >= 3}
            className={`
              w-full border-2 border-dashed rounded-xl py-3.5 text-[13px] font-semibold transition-all
              ${selectedCategories.length >= 3
                ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-white'
                : 'border-gray-300 text-gray-600 hover:border-[#2C2C2C] hover:text-[#2C2C2C] hover:bg-white bg-white'
              }
            `}
          >
            {selectedCategories.length >= 3 ? '✓ Maximum categories selected' : '+ Add Categories'}
          </button>
        </div>

        {/* Ticket Tiers */}
        <div className="mb-6 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[12px] text-gray-500 font-semibold uppercase tracking-wide">
              Ticket Tiers ({ticketTiers.length})
            </label>
            <button
              onClick={addTicketTier}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all text-[#2C2C2C] hover:bg-gray-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tier
            </button>
          </div>
          
          {/* Ticket Tiers List */}
          <div className="space-y-2">
            {ticketTiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between group hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Ticket className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900">
                      {tier.name || 'Untitled Tier'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span>${tier.price || '0'}</span>
                      <span>•</span>
                      <span>{tier.quantity ? `${tier.quantity} tickets` : 'Unlimited'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditingTicket(tier)}
                    className="text-gray-500 hover:text-[#2C2C2C] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {ticketTiers.length > 1 && (
                    <button
                      onClick={() => deleteTicketTier(tier.id)}
                      className="text-gray-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation 
        currentPage="create"
        onNavigate={onNavigate}
        onOpenMessages={onOpenMessages || (() => {})}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-[430px] rounded-2xl overflow-hidden flex flex-col shadow-2xl max-h-[80vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Select Categories</h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Category Count */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-[13px] text-gray-600">
                Selected: <span className="font-semibold">{selectedCategories.length}/3</span>
                {selectedCategories.length === 3 && (
                  <span className="ml-2 text-orange-600">(Maximum reached)</span>
                )}
              </p>
            </div>

            {/* Category Grid */}
            <div className="overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                {availableCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  const isDisabled = !isSelected && selectedCategories.length >= 3;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      disabled={isDisabled}
                      className={`
                        px-4 py-3 rounded-lg text-[13px] font-medium transition-all
                        ${isSelected 
                          ? 'bg-[#2C2C2C] text-white' 
                          : isDisabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-gray-200 bg-white">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-full bg-[#2C2C2C] text-white py-3 rounded-lg text-[14px] font-semibold hover:bg-[#1a1a1a] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Tier Edit Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-[380px] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Edit Ticket Tier</h2>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Ticket Tier Form */}
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-[12px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  value={editingTicket?.name || ''}
                  onChange={(e) => updateTicketTier(editingTicket?.id || '', 'name', e.target.value)}
                  placeholder="Enter ticket name..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#2C2C2C] transition-colors"
                />
              </div>
              <div className="mb-4">
                <label className="block text-[12px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">Price</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-[12px]">$</span>
                  <input
                    type="text"
                    value={editingTicket?.price || ''}
                    onChange={(e) => updateTicketTier(editingTicket?.id || '', 'price', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-2 py-2 text-[12px] outline-none focus:border-[#2C2C2C] transition-colors"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-[12px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">Quantity</label>
                <input
                  type="text"
                  value={editingTicket?.quantity || ''}
                  onChange={(e) => updateTicketTier(editingTicket?.id || '', 'quantity', e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#2C2C2C] transition-colors"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <button
                onClick={() => saveEditedTicket()}
                className="w-full bg-[#2C2C2C] text-white py-3 rounded-lg text-[14px] font-semibold hover:bg-[#1a1a1a] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}