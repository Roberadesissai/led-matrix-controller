// src/components/controls/brightness-control.tsx
'use client';

import { useState, useCallback } from 'react';
import { useLEDMatrix } from '@/lib/store/led-store';
import { Sun } from 'lucide-react';
import { debounce } from 'lodash';

export function BrightnessControl() {
  const { brightness: globalBrightness, setBrightness } = useLEDMatrix();
  const [localBrightness, setLocalBrightness] = useState(globalBrightness);

  const debouncedSetBrightness = useCallback(
    debounce((value: number) => {
      setBrightness(value);
    }, 100),
    []
  );

  const handleBrightnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setLocalBrightness(value);
    debouncedSetBrightness(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sun className="w-5 h-5 text-yellow-500" />
          <span className="font-medium text-white">Brightness</span>
        </div>
        <span className="text-sm text-gray-400">{localBrightness}</span>
      </div>

      <div className="relative">
        <div className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-gray-700 via-yellow-500 to-white rounded" />
        <input
          type="range"
          min="0"
          max="255"
          value={localBrightness}
          onChange={handleBrightnessChange}
          aria-label="Brightness control"
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
    </div>
  );
}