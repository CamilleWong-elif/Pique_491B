import { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, CheckCircle, Mail } from 'lucide-react';
import { Event } from '../types/Event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface PaymentPageProps {
  event: Event;
  onBack: () => void;
  onPaymentComplete: (quantity: number, total: number) => void;
}

export function PaymentPage({ event, onBack, onPaymentComplete }: PaymentPageProps) {
  const [cardNumber, setCardNumber] = useState('4532 1234 5678 9010');
  const [cardName, setCardName] = useState('John Smith');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Calculate price based on price point (mock calculation)
  const pricePerTicket = event.pricePoint === 1 ? 25 : 
                         event.pricePoint === 2 ? 50 : 
                         event.pricePoint === 3 ? 100 : 150;
  const subtotal = pricePerTicket * quantity;
  const serviceFee = subtotal * 0.1; // 10% service fee
  const total = subtotal + serviceFee;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirmation(true);
      
      // Auto-close modal and navigate after 2.5 seconds
      setTimeout(() => {
        setShowConfirmation(false);
        onPaymentComplete(quantity, total);
      }, 2500);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="bg-white h-[932px] overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className="px-[26px] pt-[59px] pb-4 border-b border-gray-200"> {/* Added notch padding */}
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="w-[40px] h-[40px] rounded-full bg-gray-200 flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[20px] font-bold">Payment</h1>
        </div>
      </div>

      <div className="px-[26px] py-6 pb-[140px]">
        {/* Event Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-[16px] font-semibold mb-2">{event.name}</h2>
          <p className="text-[13px] text-gray-600 mb-1">{event.city}, {event.state}</p>
          <p className="text-[13px] text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <label className="text-[14px] font-semibold mb-2 block">Number of Tickets</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-[40px] h-[40px] rounded-full bg-gray-200 flex items-center justify-center font-bold text-[18px]"
            >
              -
            </button>
            <span className="text-[18px] font-semibold w-[40px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="w-[40px] h-[40px] rounded-full bg-gray-200 flex items-center justify-center font-bold text-[18px]"
            >
              +
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 mr-2" />
            <h2 className="text-[16px] font-semibold">Payment Information</h2>
          </div>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="text-[13px] text-gray-700 mb-1 block">Card Number</label>
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value.slice(0, 19));
                  setCardNumber(formatted);
                }}
                className="w-full"
                maxLength={19}
              />
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="text-[13px] text-gray-700 mb-1 block">Cardholder Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] text-gray-700 mb-1 block">Expiry Date</label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setExpiryDate(formatted);
                  }}
                  className="w-full"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-[13px] text-gray-700 mb-1 block">CVV</label>
                <Input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className="w-full"
                  maxLength={3}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[13px] text-gray-700 mb-1 block">
                Email <span className="text-red-600">*</span>
              </label>
              <Input
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[13px] text-gray-700 mb-1 block">
                Phone Number <span className="text-gray-500">(Optional)</span>
              </label>
              <Input
                type="tel"
                placeholder="(123) 456-7890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full"
                maxLength={10}
              />
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-600">Subtotal ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-semibold">${serviceFee.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between text-[16px] border-t border-gray-200 pt-2">
            <span className="font-bold">Total</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3 mb-6">
          <Lock className="w-4 h-4 text-green-600" />
          <p className="text-[12px] text-green-800">
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Non-refundable Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          <p className="text-[12px] text-amber-900 font-semibold mb-1">
            Please note: All ticket sales are final
          </p>
          <p className="text-[11px] text-amber-800">
            Tickets are non-refundable and cannot be exchanged. Please review your order carefully before completing your purchase.
          </p>
        </div>
      </div>

      {/* Fixed Payment Button */}
      <div className="fixed bottom-[30px] left-0 right-0 flex justify-center px-[26px] pointer-events-none z-40">
        <Button
          onClick={handlePayment}
          disabled={isProcessing || !cardNumber || !cardName || !expiryDate || !cvv || !email}
          className="pointer-events-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-12 rounded-full shadow-lg text-[16px] transition-all active:scale-95 w-full max-w-[380px] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-[26px]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-[350px] w-full animate-in">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-[80px] h-[80px] bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-[50px] h-[50px] text-green-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-[22px] font-bold mb-2 text-gray-900">Booking Confirmed!</h2>
            
            {/* Subtitle */}
            <p className="text-[14px] text-gray-600 mb-4">
              Your payment has been processed successfully
            </p>

            {/* Email Confirmation */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Mail className="w-5 h-5 text-blue-600" />
                <p className="text-[14px] font-semibold text-blue-900">
                  Confirmation Email Sent
                </p>
              </div>
              <p className="text-[12px] text-blue-800">
                Check {email} for booking details
              </p>
            </div>

            {/* Auto-redirect message */}
            <p className="text-[12px] text-gray-500">
              Redirecting to confirmation page...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}