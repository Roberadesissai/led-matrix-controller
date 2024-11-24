'use client';

import { useEffect, useState } from 'react';

export function MonitorTime() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDate(now.toLocaleDateString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="text-2xl font-bold bg-gray-700 h-32 rounded" />
        <div className="text-xs text-muted-foreground bg-gray-700 h-4 w-24 mt-1 rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="text-2xl font-bold">{time}</div>
      <div className="text-xs text-muted-foreground">{date}</div>
    </>
  );
}
