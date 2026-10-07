import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { formatDuration } from '../name';
import { colors, control, radius } from '../theme';
import { styles } from '../ui';

export function SavedScreen({ title, durationMs, onDone }: { title: string; durationMs: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center', gap: 16 }]} testID="screen-saved">
      <View style={{ width: control.size, height: control.size, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.ok} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      </View>
      <Text style={styles.heading}>Saved</Text>
      <Text style={styles.meta}>{title} · {formatDuration(durationMs)}</Text>
    </View>
  );
}
