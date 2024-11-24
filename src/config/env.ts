export const config = {
  mqtt: {
    // Use secure WebSocket for production
    url: process.env.NEXT_PUBLIC_MQTT_URL || 'ws://66.73.10.9:1883',
    options: {
      clientId: `triplight_${Math.random().toString(16).slice(2, 10)}`,
      username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      keepalive: 30,
      reconnectPeriod: 5000,
    }
  }
}; 