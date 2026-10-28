import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const CountdownTimer = ({ closesAt, onExpire, compact = false, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTime = () => {
      if (!closesAt) return;
      const difference = new Date(closesAt).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [closesAt, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className={`inline-flex items-center gap-1 font-medium text-xs text-[#9E392F] ${className}`}>
        <Clock className="w-3.5 h-3.5 shrink-0" />
        Auction Ended
      </span>
    );
  }

  const isUrgent = !timeLeft.days && !timeLeft.hours && timeLeft.minutes < 5;

  if (compact) {
    let text = '';
    if (timeLeft.days > 0) text = `${timeLeft.days}d ${timeLeft.hours}h left`;
    else if (timeLeft.hours > 0) text = `${timeLeft.hours}h ${timeLeft.minutes}m left`;
    else text = `${timeLeft.minutes}m ${timeLeft.seconds}s left`;

    return (
      <span
        className={`inline-flex items-center gap-1 font-medium text-xs ${
          isUrgent ? 'text-[#9E392F] font-semibold animate-pulse' : 'text-olive'
        } ${className}`}
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        {text}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      <div className={`px-2 py-1 rounded border ${isUrgent ? 'border-[#9E392F]/40 bg-[#9E392F]/10 text-[#9E392F]' : 'border-border bg-stone text-ink'} flex flex-col items-center min-w-[36px]`}>
        <span className="font-mono font-bold leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[9px] text-olive uppercase mt-0.5">d</span>
      </div>
      <span className="text-olive font-bold">:</span>
      <div className={`px-2 py-1 rounded border ${isUrgent ? 'border-[#9E392F]/40 bg-[#9E392F]/10 text-[#9E392F]' : 'border-border bg-stone text-ink'} flex flex-col items-center min-w-[36px]`}>
        <span className="font-mono font-bold leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[9px] text-olive uppercase mt-0.5">h</span>
      </div>
      <span className="text-olive font-bold">:</span>
      <div className={`px-2 py-1 rounded border ${isUrgent ? 'border-[#9E392F]/40 bg-[#9E392F]/10 text-[#9E392F]' : 'border-border bg-stone text-ink'} flex flex-col items-center min-w-[36px]`}>
        <span className="font-mono font-bold leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] text-olive uppercase mt-0.5">m</span>
      </div>
      <span className="text-olive font-bold">:</span>
      <div className={`px-2 py-1 rounded border ${isUrgent ? 'border-[#9E392F]/40 bg-[#9E392F]/10 text-[#9E392F]' : 'border-border bg-stone text-ink'} flex flex-col items-center min-w-[36px]`}>
        <span className="font-mono font-bold leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] text-olive uppercase mt-0.5">s</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
