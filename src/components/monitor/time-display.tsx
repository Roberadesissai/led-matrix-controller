'use client';

import { useState, useEffect } from 'react';

export function MonitorTimeDisplay() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDate(now.toLocaleDateString());
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <>
        <div className="text-2xl font-bold">Loading...</div>
        <p className="text-xs text-muted-foreground">Loading...</p>
      </>
    );
  }

  return (
    <>
      <div className="text-2xl font-bold">{time}</div>
      <p className="text-xs text-muted-foreground">{date}</p>
    </>
  );
}