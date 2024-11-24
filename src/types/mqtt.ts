// src/types/mqtt.ts
export interface MQTTStatus {
    status?: 'connected' | 'disconnected' | 'error';
    action?: string;
    index?: number;
    state?: boolean;
    error?: string;
    type?: 'device' | 'web';
    states?: Record<string, boolean>;
    brightness?: number;
  }
  
  export interface LEDCommand {
    action: 'toggle' | 'brightness' | 'clear';
    index?: number;
    brightness?: number;
  }
  
  export interface LEDState {
    activeLeds: Set<number>;
    brightness: number;
    isConnected: boolean;
  }