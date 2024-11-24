// src/lib/store/led-store.ts
import { create } from 'zustand';
import { LEDState } from '@/types/mqtt';
import { MQTTClientService } from '../mqtt/client';
import { config } from '@/config/env';
import mqtt from 'mqtt';
import { MqttClient } from 'mqtt';

interface LEDStore extends LEDState {
  toggleLED: (index: number) => void;
  setBrightness: (value: number) => void;
  clearAll: () => void;
  setConnectionState: (state: boolean) => void;
  updateLEDState: (index: number, state: boolean) => void;
  updateAllStates: (states: Record<string, boolean>) => void;
  loadPattern: (newPattern: Set<number>) => void;
  setLeds: (leds: Set<number>) => void;
  connect: () => void;
}

interface LEDStoreState extends LEDStore {
  lastError?: string;
  isConnected: boolean;
  socket: WebSocket | null;
  client: MqttClient | null;
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
    socket: null,
    client: null,

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

    connect: () => {
      try {
        const client = mqtt.connect(config.mqtt.url, config.mqtt.options);

        client.on('connect', () => {
          console.log('Connected to MQTT broker');
          set({ isConnected: true, client });
          
          // Subscribe to necessary topics
          client.subscribe('led/matrix/#', (err) => {
            if (err) console.error('Subscription error:', err);
          });
        });

        client.on('error', (error) => {
          console.error('MQTT error:', error);
          set({ isConnected: false, client: null });
        });

        client.on('close', () => {
          console.log('MQTT connection closed');
          set({ isConnected: false, client: null });
          // Attempt to reconnect after delay
          setTimeout(() => get().connect(), 5000);
        });

        client.on('message', (topic, message) => {
          // Handle incoming messages
          const payload = JSON.parse(message.toString());
          switch(topic) {
            case 'led/matrix/state':
              set({ activeLeds: new Set(payload.leds) });
              break;
            case 'led/matrix/brightness':
              set({ brightness: payload.value });
              break;
            // Add other cases as needed
          }
        });

      } catch (error) {
        console.error('Connection error:', error);
        set({ isConnected: false, client: null });
      }
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
    setLeds,
    connect
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
    setLeds,
    connect
  };
}