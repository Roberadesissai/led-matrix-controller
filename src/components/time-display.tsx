'use client';

import { useState, useEffect } from 'react';

export function TimeDisplay({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTimeString(new Date().toLocaleTimeString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <p className="text-2xl font-bold mt-1">Loading...</p>;
  }

  return <p className="text-2xl font-bold mt-1">{timeString}</p>;
} 