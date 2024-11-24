// src/components/status/connection-status.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLEDStore } from '@/lib/store/led-store';

export function ConnectionStatus() {
  const { isConnected } = useLEDStore();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-black/20 border border-white/10"
      >
        <div 
          className={`w-2 h-2 rounded-full ${
            isConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`} 
        />
        <span className={`text-sm ${
          isConnected ? 'text-green-500' : 'text-red-500'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap">
          MQTT Connection Status
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800" />
        </div>
      )}
    </div>
  );
}