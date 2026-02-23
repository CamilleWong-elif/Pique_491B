import { useState } from 'react';
import { ArrowLeft, Star, Upload, X } from 'lucide-react';
import { Event } from '../types/Event';

interface LeaveReviewPageProps {
  event: Event;
  onBack: () => void;
  onReviewPosted: () => void;
}

export function LeaveReviewPage({ event, onBack, onReviewPosted }: LeaveReviewPageProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostReview = () => {
    // Here you would typically send the review to your backend
    onReviewPosted();
  };

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-[18px] py-4 pt-[59px] flex items-center justify-between sticky top-0 z-10"> {/* Added notch padding */}
        <button onClick={onBack} className="text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-semibold">Write a Review</h1>
        <div className="w-6"></div>
      </div>

      <div className="px-[20px] pb-[40px]">
        {/* Event Info */}
        <div className="py-5 border-b border-gray-200">
          <div className="flex gap-3">
            <img 
              src={event.imageUrl} 
              alt={event.businessName}
              className="w-[80px] h-[80px] rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="text-[16px] font-semibold text-black mb-1">{event.businessName}</h2>
              <p className="text-[13px] text-black">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Star Rating Section */}
        <div className="py-6 border-b border-gray-200">
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-[42px] h-[42px] transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-[#FF6B35] text-[#FF6B35]'
                      : 'fill-gray-300 text-gray-400'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-[14px] text-gray-600 mt-3">
              {rating === 1 && "Not good"}
              {rating === 2 && "Could've been better"}
              {rating === 3 && "OK"}
              {rating === 4 && "Good"}
              {rating === 5 && "Great"}
            </p>
          )}
        </div>

        {/* Review Text Section */}
        <div className="py-6 border-b border-gray-200">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share details of your experience at this place"
            className="w-full min-h-[140px] text-[15px] text-gray-900 placeholder-gray-400 outline-none resize-none border border-gray-300 rounded-lg p-3"
          />
          <p className="text-[12px] text-gray-500 mt-2">
            {reviewText.length} characters
          </p>
        </div>

        {/* Photo Upload Section */}
        <div className="py-6 border-b border-gray-200">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">Add Photos or Videos</h3>
          
          <div className="flex flex-wrap gap-3">
            {/* Uploaded Images */}
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative w-[90px] h-[90px]">
                <img 
                  src={img} 
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {uploadedImages.length < 10 && (
              <label className="w-[90px] h-[90px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-[11px] text-gray-500">Add</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <p className="text-[12px] text-gray-500 mt-3">
            Upload up to 10 photos or videos
          </p>
        </div>

        {/* Helpful Tips Section */}
        <div className="py-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">A few things to consider</h3>
          <ul className="space-y-2">
            <li className="text-[13px] text-gray-600 flex items-start">
              <span className="mr-2">•</span>
              <span>Would you recommend this to a friend?</span>
            </li>
            <li className="text-[13px] text-gray-600 flex items-start">
              <span className="mr-2">•</span>
              <span>What did you love or not love?</span>
            </li>
            <li className="text-[13px] text-gray-600 flex items-start">
              <span className="mr-2">•</span>
              <span>Any tips for other attendees?</span>
            </li>
          </ul>
        </div>

        {/* Post Review Button */}
        <div className="sticky bottom-0 bg-white py-4 mt-4">
          <button
            onClick={handlePostReview}
            disabled={!rating || !reviewText.trim()}
            className={`w-full py-3.5 rounded-lg text-[15px] font-semibold transition-colors ${
              rating && reviewText.trim()
                ? 'bg-[#FF6B35] text-white hover:bg-[#E55A2B]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
}