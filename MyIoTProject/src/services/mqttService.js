import mqtt from 'mqtt';

export default class MQTTService {
  client = null;

  connect(config, onMessage, onConnect, onFailure) {
    const { host, port, user, pass, clientId } = config;

    const url = `wss://${host}:${port}/mqtt`;

    this.client = mqtt.connect(url, {
      username: user,
      password: pass,
      clientId,
      reconnectPeriod: 1000,
      connectTimeout: 5000,
    });

    this.client.on('connect', () => {
      console.log('MQTT conectado');
      onConnect?.();
    });

    this.client.on('message', (topic, message) => {
      onMessage?.(topic, message.toString());
    });

    this.client.on('error', (err) => {
      console.log('MQTT erro:', err);
      onFailure?.(err);
    });
  }

  subscribe(topic) {
    this.client?.subscribe(topic);
  }

  publish(topic, message) {
    this.client?.publish(topic, message);
  }

  disconnect() {
    this.client?.end();
  }
}