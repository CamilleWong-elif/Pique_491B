import { CheckCircle } from 'lucide-react';
import { Event } from '../types/Event';
import { Button } from '../components/ui/button';

interface PaymentSuccessPageProps {
  event: Event;
  quantity: number;
  total: number;
  onComplete: () => void;
  onReturnHome: () => void;
}

export function PaymentSuccessPage({ event, quantity, total, onComplete, onReturnHome }: PaymentSuccessPageProps) {
  // Generate a random confirmation number
  const confirmationNumber = `EVT-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  const currentDate = new Date();
  const eventDate = new Date(currentDate);
  eventDate.setDate(eventDate.getDate() + 7); // Event is 7 days from now (mock)

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center px-[26px]">
      <div className="w-full max-w-[380px]">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-[100px] h-[100px] rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-[60px] h-[60px] text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-[24px] font-bold text-center mb-2">Payment Successful!</h1>
        <p className="text-[14px] text-gray-600 text-center mb-8">
          Your booking has been confirmed
        </p>

        {/* Confirmation Details */}
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="text-[12px] text-gray-500 mb-1">Confirmation Number</p>
            <p className="text-[18px] font-bold text-gray-900">{confirmationNumber}</p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[12px] text-gray-500 mb-1">Event</p>
              <p className="text-[15px] font-semibold text-gray-900">{event.name}</p>
            </div>

            <div>
              <p className="text-[12px] text-gray-500 mb-1">Location</p>
              <p className="text-[14px] text-gray-900">{event.city}, {event.state}</p>
            </div>

            <div>
              <p className="text-[12px] text-gray-500 mb-1">Date & Time</p>
              <p className="text-[14px] text-gray-900">
                {eventDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-[14px] text-gray-900">7:00 PM</p>
            </div>

            <div>
              <p className="text-[12px] text-gray-500 mb-1">Quantity</p>
              <p className="text-[14px] text-gray-900">{quantity} {quantity === 1 ? 'Ticket' : 'Tickets'}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-[12px] text-gray-500 mb-1">Total Paid</p>
              <p className="text-[20px] font-bold text-gray-900">${total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-[13px] text-blue-900 font-semibold mb-1">
            Confirmation email sent!
          </p>
          <p className="text-[12px] text-blue-800">
            A confirmation email with your ticket details has been sent to your email address.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={onComplete}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-12 rounded-full shadow-lg text-[16px] transition-all active:scale-95"
        >
          View My Bookings
        </Button>

        {/* Return Home Button */}
        <Button
          onClick={onReturnHome}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-4 px-12 rounded-full shadow-lg text-[16px] transition-all active:scale-95 mt-4"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}