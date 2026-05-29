import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import MQTTService from './src/services/mqttService';
import { saveSensorReading, saveLightState } from './src/services/supabaseService';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';

const mqtt = new MQTTService();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);

  const mqttConfig = {
    host: process.env.EXPO_PUBLIC_MQTT_HOST,
    port: Number(process.env.EXPO_PUBLIC_MQTT_PORT || 8884),
    user: process.env.EXPO_PUBLIC_MQTT_USER,
    pass: process.env.EXPO_PUBLIC_MQTT_PASS,
    clientId: `RN_App_${Math.random()}`
  };

  const startConnection = () => {
    setShowError(false);

    mqtt.connect(
      mqttConfig,

      (topic, message) => {
        switch (topic) {
          case 'casa/temp': {
            const value = parseFloat(message);
            setTemp(value);
            saveSensorReading(topic, value);
            break;
          }

          case 'casa/umid': {
            const value = parseFloat(message);
            setHum(value);
            saveSensorReading(topic, value);
            break;
          }

          case 'casa/luz': {
            const isOn = message === '1';
            setIsLightOn(isOn);
            saveSensorReading(topic, message);
            break;
          }

          default:
            break;
        }
      },

      () => {
        setIsConnected(true);

        mqtt.subscribe('casa/temp');
        mqtt.subscribe('casa/umid');
        mqtt.subscribe('casa/luz');
      },

      (err) => {
        console.log('Erro MQTT:', err);

        setIsConnected(false);
        setShowError(true);
      }
    );
  };

  const toggleLight = () => {
    const newState = isLightOn ? '0' : '1';

    mqtt.publish('casa/luz', newState);
    setIsLightOn(!isLightOn);
    saveLightState(!isLightOn);
  };

  useEffect(() => {
    startConnection();

    return () => {
      mqtt.disconnect?.();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smart Home IoT</Text>

      <LightControl
        isLightOn={isLightOn}
        onToggle={toggleLight}
      />

      <Gauges
        temp={temp}
        hum={hum}
      />

      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />

      <Text style={styles.connection}>
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
  },

  connection: {
    color: '#AAA',
    marginTop: 20,
    fontSize: 14,
  },
});