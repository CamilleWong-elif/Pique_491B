import { useState } from 'react';
import { X, Mail, MessageSquare, Send } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setFormData({ email: '', message: '' });
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ email: '', message: '' });
      setErrors({});
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[390px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5 relative">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-[22px] font-bold text-white mb-1">Contact Us</h2>
          <p className="text-[13px] text-white/90">We'd love to hear from you!</p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="px-6 py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-[20px] font-bold text-gray-800 mb-2">Message Sent!</h3>
            <p className="text-[14px] text-gray-600">
              Thank you for reaching out. We'll get back to you within 24-48 hours.
            </p>
          </div>
        ) : (
          /* Contact Form */
          <form onSubmit={handleSubmit} className="px-6 py-6">
            {/* Email Input */}
            <div className="mb-5">
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                Your Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg text-[14px] outline-none transition-colors ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-sky-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-[12px] text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">
                Your Message
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <textarea
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) {
                      setErrors({ ...errors, message: '' });
                    }
                  }}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg text-[14px] outline-none transition-colors resize-none ${
                    errors.message
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-sky-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.message && (
                <p className="text-[12px] text-red-600 mt-1">{errors.message}</p>
              )}
              <p className="text-[11px] text-gray-500 mt-1">
                Minimum 10 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-[14px] hover:from-sky-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-[12px] text-gray-600 text-center mb-3">
                Or reach us directly at:
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:support@pique.app"
                  className="block text-[13px] text-sky-600 hover:text-sky-700 font-medium text-center"
                >
                  support@pique.app
                </a>
                <a 
                  href="tel:+13105551234"
                  className="block text-[13px] text-sky-600 hover:text-sky-700 font-medium text-center"
                >
                  (310) 555-1234
                </a>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
