import { useEffect } from 'react';
import logo from 'figma:asset/976db71848c7d73a74d52b0e198c294a490be21e.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <img 
          src={logo} 
          alt="Pique" 
          className="w-48 h-auto object-contain"
          style={{
            animation: 'scaleAndFade 1.5s ease-out forwards'
          }}
        />
      </div>
      
      <style>{`
        @keyframes scaleAndFade {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}