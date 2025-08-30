import React from 'react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

interface MagicButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const MagicButton: React.FC<MagicButtonProps> = ({ onClick, disabled = false, loading = false }) => {
  const handleClick = () => {
    // Trigger confetti animation
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B']
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Call the actual onClick handler
    onClick();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className="magic-button w-full h-16 text-xl font-bold rounded-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Tworzenie...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span>✨</span>
          <span>Stwórz</span>
        </div>
      )}
    </Button>
  );
};

export default MagicButton;