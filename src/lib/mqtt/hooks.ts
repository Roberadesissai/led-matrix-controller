// // src/lib/mqtt/hooks.ts
// import { useEffect, useCallback, useState } from 'react';
// import { MQTTClientService } from './client';
// import { MQTTStatus, LEDCommand, MQTTConfig } from '@/types/mqtt';

// interface UseMQTTProps {
//   config?: Partial<MQTTConfig>;
//   onStatus?: (status: MQTTStatus) => void;
// }

// export function useMQTT({ config, onStatus }: UseMQTTProps = {}) {
//   const [isConnected, setIsConnected] = useState(false);
//   const [lastStatus, setLastStatus] = useState<MQTTStatus | null>(null);
  
//   const mqtt = MQTTClientService.getInstance(config);

//   const handleStatus = useCallback((status: MQTTStatus) => {
//     setLastStatus(status);
//     if (status.status === 'connected') {
//       setIsConnected(true);
//     } else if (status.status === 'disconnected' || status.status === 'error') {
//       setIsConnected(false);
//     }
//     onStatus?.(status);
//   }, [onStatus]);

//   useEffect(() => {
//     const unsubscribe = mqtt.onStatus(handleStatus);
//     setIsConnected(mqtt.getConnectionStatus());

//     return () => {
//       unsubscribe();
//     };
//   }, [mqtt, handleStatus]);

//   const sendCommand = useCallback((command: LEDCommand) => {
//     mqtt.sendCommand(command);
//   }, [mqtt]);

//   return {
//     isConnected,
//     lastStatus,
//     sendCommand,
//     getConnectionStatus: mqtt.getConnectionStatus.bind(mqtt),
//   };
// }

// // Example usage hook for LED-specific MQTT operations
// export function useLEDMQTT() {
//   const { sendCommand, isConnected, lastStatus } = useMQTT();

//   const toggleLED = useCallback((index: number) => {
//     sendCommand({ action: 'toggle', index });
//   }, [sendCommand]);

//   const setBrightness = useCallback((brightness: number) => {
//     sendCommand({ action: 'brightness', brightness });
//   }, [sendCommand]);

//   const clearAll = useCallback(() => {
//     sendCommand({ action: 'clear' });
//   }, [sendCommand]);

//   return {
//     isConnected,
//     lastStatus,
//     toggleLED,
//     setBrightness,
//     clearAll,
//   };
// }