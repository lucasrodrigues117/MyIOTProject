import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveSensorReading(topic, value) {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      'Supabase não está configurado. Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
    return;
  }

  const reading = {
    topic,
    value: value?.toString?.() ?? '',
    recorded_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('iot_readings')
    .insert([reading]);

  if (error) {
    console.log('Erro ao salvar leitura no Supabase:', error.message);
  }
}

export async function saveLightState(isOn) {
  return saveSensorReading('casa/luz', isOn ? '1' : '0');
}