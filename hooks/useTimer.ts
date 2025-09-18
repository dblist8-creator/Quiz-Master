import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (duration: number, onTimeUp: () => void) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  // FIX: In a browser environment, setInterval returns a number, not a NodeJS.Timeout object.
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    // By checking the ref, we avoid a dependency on `isRunning` state,
    // which was causing a re-render loop.
    if (timerRef.current !== null) {
        return;
    }

    setIsRunning(true);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prevTime => {
        // When time is up, stop the timer and trigger the callback
        if (prevTime <= 1) {
          stop();
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [onTimeUp, stop]);

  const reset = useCallback((newDuration?: number) => {
    stop();
    setTimeLeft(newDuration ?? duration);
  }, [duration, stop]);

  useEffect(() => {
    // Clean up the interval on component unmount
    return () => stop();
  }, [stop]);

  return { timeLeft, start, stop, reset, isRunning };
};