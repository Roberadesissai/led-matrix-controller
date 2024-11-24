// src/lib/store/led-store.ts
import { create } from 'zustand';
import { LEDState } from '@/types/mqtt';
import { MQTTClientService } from '../mqtt/client';

interface LEDStore extends LEDState {
  toggleLED: (index: number) => void;
  setBrightness: (value: number) => void;
  clearAll: () => void;
  setConnectionState: (state: boolean) => void;
  updateLEDState: (index: number, state: boolean) => void;
  updateAllStates: (states: Record<string, boolean>) => void;
  loadPattern: (newPattern: Set<number>) => void;
  setLeds: (leds: Set<number>) => void;
}

interface LEDStoreState extends LEDStore {
  lastError?: string;
  isConnected: boolean;
}

export const useLEDStore = create<LEDStoreState>((set, get) => {
  // Initialize MQTT client
  const mqttClient = MQTTClientService.getInstance();

  return {
    matrix: undefined,
    activeLeds: new Set<number>(),
    ledColors: new Map(),
    brightness: 255,
    isConnected: false,
    lastError: undefined,

    toggleLED: (index: number) => {
      mqttClient.sendCommand({ action: 'toggle', index });
    },

    setBrightness: (value: number) => {
      mqttClient.sendCommand({ action: 'brightness', brightness: value });
      set({ brightness: value });
    },

    clearAll: () => {
      mqttClient.sendCommand({ action: 'clear' });
      set({ activeLeds: new Set() });
    },

    setConnectionState: (state: boolean) => {
      set({ isConnected: state });
    },

    updateLEDState: (index: number, state: boolean) => {
      set((store) => {
        const newActiveLeds = new Set(store.activeLeds);
        if (state) {
          newActiveLeds.add(index);
        } else {
          newActiveLeds.delete(index);
        }
        return { activeLeds: newActiveLeds };
      });
    },

    updateAllStates: (states: Record<string, boolean>) => {
      const newActiveLeds = new Set<number>();
      Object.entries(states).forEach(([index, state]) => {
        if (state) {
          newActiveLeds.add(parseInt(index));
        }
      });
      set({ activeLeds: newActiveLeds });
    },

    loadPattern: (newPattern: Set<number>) => {
      set({ activeLeds: newPattern });
    },

    setLeds: (leds: Set<number>) => {
      set({ activeLeds: leds });
    },
  };
});

// Helper hook for components
export function useLEDMatrix() {
  const {
    activeLeds,
    brightness,
    isConnected,
    toggleLED,
    setBrightness,
    clearAll,
    setConnectionState,
    updateLEDState,
    updateAllStates,
    loadPattern,
    setLeds
  } = useLEDStore();

  return {
    activeLeds,
    brightness,
    isConnected,
    toggleLED,
    setBrightness,
    clearAll,
    setConnectionState,
    updateLEDState,
    updateAllStates,
    loadPattern,
    setLeds
  };
}