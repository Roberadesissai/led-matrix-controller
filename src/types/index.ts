// src/types/index.ts
export interface LEDState {
    activeLeds: Set<number>;
    brightness: number;
    connected: boolean;
  }
  
  export interface LEDCommand {
    action: 'toggle' | 'brightness' | 'clear';
    index?: number;
    brightness?: number;
  }
  
  export interface MQTTStatus {
    action?: string;
    index?: number;
    state?: boolean;
    brightness?: number;
    status?: string;
    error?: string;
  }