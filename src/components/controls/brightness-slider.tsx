'use client';

import { useLEDMatrix } from "@/lib/store/led-store";
import { useState, useEffect } from "react";

export function BrightnessSlider() {
  const { brightness, setBrightness, isConnected } = useLEDMatrix();
  const [localBrightness, setLocalBrightness] = useState(brightness);

  useEffect(() => {
    setLocalBrightness(brightness);
  }, [brightness]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLocalBrightness(value);
    setBrightness(value);
  };

  return (
    <div className="relative">
      <div className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-gray-700 via-yellow-500 to-white rounded" />
      <input
        type="range"
        min="0"
        max="100"
        aria-label="Brightness"
        value={localBrightness}
        onChange={handleChange}
        disabled={!isConnected}
        className="w-full h-2 bg-transparent appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-yellow-500
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-white
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:shadow-yellow-500/30
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:hover:scale-110
          relative z-10"
      />
    </div>
  );
}