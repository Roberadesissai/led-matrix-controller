// src/lib/mqtt/client.ts
import mqtt, { MqttClient, IClientOptions, Packet } from 'mqtt';
import { MQTTStatus, LEDCommand } from '@/types/mqtt';

interface MQTTConfig {
  brokerUrl: string;
  clientId: string;
  topics: {
    commands: string;
    status: string;
  };
  options: IClientOptions;
}

const MQTT_CONFIG: MQTTConfig = {
  brokerUrl: 'ws://broker.hivemq.com:8000/mqtt',
  clientId: `web-client-${Math.random().toString(16).slice(2)}-${Date.now()}`,
  topics: {
    commands: 'led_matrix/commands',
    status: 'led_matrix/status'
  },
  options: {
    keepalive: 30,
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 30 * 1000,
    will: {
      topic: 'led_matrix/status',
      payload: JSON.stringify({ status: 'offline', type: 'web' }),
      qos: 0,
      retain: false
    },
    rejectUnauthorized: false
  }
};

export class MQTTClientService {
  private static instance: MQTTClientService | null = null;
  private client: MqttClient | null = null;
  private statusCallbacks: Set<(status: MQTTStatus) => void>;
  private connectionStatus: boolean;
  private reconnectTimer: NodeJS.Timeout | null;
  private connectAttempts: number;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 3000;

  private constructor() {
    this.statusCallbacks = new Set();
    this.connectionStatus = false;
    this.reconnectTimer = null;
    this.connectAttempts = 0;
    this.connect();
  }

  public static getInstance(): MQTTClientService {
    if (!MQTTClientService.instance) {
      MQTTClientService.instance = new MQTTClientService();
    }
    return MQTTClientService.instance;
  }

  private connect(): void {
    try {
      console.log('Connecting to MQTT broker:', MQTT_CONFIG.brokerUrl);
      
      if (this.client) {
        this.client.end(true);
      }

      this.client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
        ...MQTT_CONFIG.options,
        clientId: `${MQTT_CONFIG.clientId}-${this.connectAttempts}`
      });

      this.setupEventHandlers();

    } catch (error) {
      console.error('Connection error:', error);
      this.handleConnectionFailure();
    }
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('connect', this.handleConnect.bind(this));
    this.client.on('message', this.handleMessage.bind(this));
    this.client.on('error', this.handleError.bind(this));
    this.client.on('close', this.handleClose.bind(this));
    this.client.on('offline', this.handleOffline.bind(this));
    this.client.on('reconnect', this.handleReconnect.bind(this));
  }

  private handleConnect(connack: any): void {
    console.log('Connected to MQTT broker', connack);
    this.connectionStatus = true;
    this.connectAttempts = 0;
    
    // Subscribe to status topic
    this.client?.subscribe(MQTT_CONFIG.topics.status, { qos: 1 }, (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log('Subscribed to:', MQTT_CONFIG.topics.status);
      }
    });

    // Notify connection status
    this.notifySubscribers({ 
      status: 'connected',
      type: 'web'
    });
  }

  private handleMessage(topic: string, message: Buffer, packet: Packet): void {
    try {
      const payload = JSON.parse(message.toString());
      console.log('Received message:', topic, payload);
      this.notifySubscribers(payload);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  private handleError(error: Error): void {
    console.error('MQTT Error:', error);
    this.notifySubscribers({ 
      status: 'error',
      error: error.message
    });
  }

  private handleClose(): void {
    console.log('MQTT connection closed');
    this.connectionStatus = false;
    this.handleConnectionFailure();
  }

  private handleOffline(): void {
    console.log('MQTT client offline');
    this.connectionStatus = false;
    this.notifySubscribers({ status: 'disconnected' });
  }

  private handleReconnect(): void {
    console.log('Attempting to reconnect...');
    this.connectAttempts++;
  }

  private handleConnectionFailure(): void {
    if (this.connectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnection attempts reached');
      this.notifySubscribers({ 
        status: 'error',
        error: 'Failed to connect after multiple attempts'
      });
      return;
    }

    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnection attempt ${this.connectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS}`);
      this.connect();
    }, this.RECONNECT_DELAY);
  }

  private notifySubscribers(status: MQTTStatus): void {
    this.statusCallbacks.forEach(callback => callback(status));
  }

  public sendCommand(command: LEDCommand): void {
    if (!this.client?.connected) {
      console.error('MQTT client not connected');
      this.notifySubscribers({ 
        status: 'error',
        error: 'Client not connected'
      });
      return;
    }

    try {
      const message = JSON.stringify(command);
      console.log('Sending command:', message);
      
      this.client.publish(MQTT_CONFIG.topics.commands, message, { qos: 1 }, (error) => {
        if (error) {
          console.error('Publish error:', error);
          this.notifySubscribers({
            status: 'error',
            error: 'Failed to send command'
          });
        }
      });
    } catch (error) {
      console.error('Error sending command:', error);
      this.notifySubscribers({
        status: 'error',
        error: 'Failed to send command'
      });
    }
  }

  public onStatus(callback: (status: MQTTStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  public isConnected(): boolean {
    return this.connectionStatus;
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.client) {
      this.client.end(true, undefined, () => {
        console.log('MQTT client disconnected');
      });
    }
  }
}