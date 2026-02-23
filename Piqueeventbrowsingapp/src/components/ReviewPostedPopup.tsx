import { X, Check } from 'lucide-react';
import { useEffect } from 'react';

interface ReviewPostedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export function ReviewPostedPopup({ isOpen, onClose, onNavigate }: ReviewPostedPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
        onNavigate('event');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none pt-[60px]">
      <div className="bg-white rounded-xl shadow-lg p-4 mx-6 w-[300px] animate-slide-down pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-gray-900">Review Posted!</h3>
            <p className="text-[13px] text-gray-600">
              Thank you for sharing your experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}