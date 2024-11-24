// src/components/led-matrix/led-grid.tsx
'use client';

import { useEffect } from 'react';
import { useLEDMatrix } from '@/lib/store/led-store';
import { MQTTClientService } from '@/lib/mqtt/client';

const MATRIX_HEIGHT = 8;
const MATRIX_WIDTH = 20;

export function LEDGrid() {
  const {
    activeLeds,
    isConnected,
    toggleLED,
    setConnectionState,
    updateLEDState,
    updateAllStates
  } = useLEDMatrix();

  useEffect(() => {
    const mqtt = MQTTClientService.getInstance();

    const unsubscribe = mqtt.onStatus((status) => {
      if (status.status === 'connected' || status.status === 'disconnected') {
        setConnectionState(status.status === 'connected');
      }

      if (status.action === 'toggle' && typeof status.index === 'number') {
        updateLEDState(status.index, status.state || false);
      }

      if (status.action === 'states' && status.states) {
        updateAllStates(status.states);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setConnectionState, updateLEDState, updateAllStates]);

  const getZigzagIndex = (row: number, col: number): number => {
    if (row % 2 === 0) {
      return (row * MATRIX_WIDTH) + (MATRIX_WIDTH - 1 - col);
    } else {
      return (row * MATRIX_WIDTH) + col;
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
      <div className="grid gap-1">
        {Array.from({ length: MATRIX_HEIGHT }, (_, row) => (
          <div key={row} className="flex gap-1 justify-center">
            {Array.from({ length: MATRIX_WIDTH }, (_, col) => {
              const index = getZigzagIndex(row, col);
              const isActive = activeLeds.has(index);
              
              return (
                <button
                  key={index}
                  onClick={() => isConnected && toggleLED(index)}
                  className={`
                    w-10 h-10 rounded-full transition-all duration-300
                    flex items-center justify-center text-[10px]
                    ${isConnected
                      ? isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50 scale-110 animate-pulse'
                        : 'bg-gray-800 hover:bg-gray-700 hover:scale-105'
                      : 'bg-gray-900 cursor-not-allowed opacity-50'
                    }
                    ${isActive ? 'text-white' : 'text-gray-500'}
                  `}
                  disabled={!isConnected}
                >
                  <span className="opacity-50">{index}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}