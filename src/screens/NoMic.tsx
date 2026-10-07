import { openSettings } from 'expo-linking';
import { Text, View } from 'react-native';
import { Button, styles } from '../ui';

export function NoMic({ onBack }: { onBack: () => void }) {
  return (
    <View style={[styles.screen, { justifyContent: 'center', paddingHorizontal: 24, gap: 16 }]} testID="screen-nomic">
      <Text style={[styles.heading, { textAlign: 'center' }]}>Meeting Assistant needs the microphone to record.</Text>
      <Text style={[styles.meta, { textAlign: 'center' }]}>Allow it in Settings, then come back and tap record.</Text>
      <Button label="Open Settings" onPress={() => openSettings()} />
      <Button label="Not now" kind="secondary" onPress={onBack} />
    </View>
  );
}
