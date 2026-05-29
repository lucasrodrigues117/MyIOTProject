import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const env = process.env || {};

const supabaseUrl =
  env.EXPO_PUBLIC_SUPABASE_URL ||
  env.SUPABASE_URL ||
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  Constants?.manifest?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  Constants?.expoConfig?.extra?.SUPABASE_URL ||
  Constants?.manifest?.extra?.SUPABASE_URL ||
  '';

const supabaseKey =
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants?.manifest?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants?.expoConfig?.extra?.SUPABASE_ANON_KEY ||
  Constants?.manifest?.extra?.SUPABASE_ANON_KEY ||
  '';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase configurado:', supabaseUrl.replace(/(^https?:\/\/|\/.+$)/g, ''));
} else {
  console.warn(
    'Supabase não está configurado. Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY em app config ou process.env.'
  );
}

export async function saveSensorReading(topic, value) {
  if (!supabase) return;

  const reading = {
    topic,
    value: value?.toString?.() ?? '',
    recorded_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('iot_readings').insert([reading]);

  if (error) {
    console.log('Erro ao salvar leitura no Supabase:', error.message);
  }
}

export async function saveLightState(isOn) {
  return saveSensorReading('casa/luz', isOn ? '1' : '0');
}