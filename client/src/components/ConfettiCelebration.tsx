import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  durationMs?: number;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ durationMs = 5000 }) => {
  useEffect(() => {
    const end = Date.now() + durationMs;
    const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#facc15', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [durationMs]);

  return null;
};
