import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Text, View } from 'react-native';
import type { State } from '../machine';
import { formatDuration } from '../name';
import { colors } from '../theme';
import { Button, Control, Sheet, styles } from '../ui';

type Live = Extract<State, { kind: 'recording' | 'stopSheet' | 'discardConfirm' }>;

type Props = {
  state: Live;
  onStop: () => void;
  onKeep: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onCancelDiscard: () => void;
  onConfirmDiscard: () => void;
};

export function RecordingScreen({ state, onStop, onKeep, onSave, onDiscard, onCancelDiscard, onConfirmDiscard }: Props) {
  const breathing = state.kind === 'recording';
  return (
    <View style={styles.screen} testID="screen-recording">
      <View style={{ paddingTop: 64, alignItems: 'center' }}>
        <Text style={styles.meta}>{state.title}</Text>
      </View>
      <Aurora active={breathing} />
      <View style={styles.bottom}>
        <Control kind="stop" label="Stop" onPress={onStop} testID="stop" />
      </View>

      {state.kind === 'stopSheet' && (
        <Sheet>
          <View style={{ gap: 8 }}>
            <Text style={styles.heading}>Stop and save?</Text>
            <Text style={[styles.bodyText, { color: colors.textMuted }]}>{state.title}, {formatDuration(Date.now() - state.startedAt)}.</Text>
          </View>
          <View style={styles.stack}>
            <Button label="Stop and save" onPress={onSave} testID="stop-and-save" />
            <Button label="Keep recording" kind="secondary" onSurface onPress={onKeep} testID="keep-recording" />
            <Button label="Discard" kind="destructive" onPress={onDiscard} testID="discard" />
          </View>
        </Sheet>
      )}

      {state.kind === 'discardConfirm' && (
        <Sheet>
          <View style={{ gap: 8 }}>
            <Text style={styles.heading}>Discard {formatDuration(state.durationMs)} of audio?</Text>
            <Text style={[styles.bodyText, { color: colors.textMuted }]}>This can't be undone.</Text>
          </View>
          <View style={styles.stack}>
            <Button label="Discard" kind="destructive" onSurface onPress={onConfirmDiscard} testID="confirm-discard" />
            <Button label="Cancel" kind="secondary" onSurface onPress={onCancelDiscard} />
          </View>
        </Sheet>
      )}
    </View>
  );
}

// The "still recording" signal: a wide blue-to-violet band low on the screen
// that breathes. Holds still under a sheet and under reduced motion.
function Aurora({ active }: { active: boolean }) {
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active || reduce) return;
      loop = Animated.loop(Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));
      loop.start();
    });
    return () => loop?.stop();
  }, [active, breath]);

  const scaleY = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const scaleX = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: -65, right: -65, bottom: 120, height: 220, alignItems: 'center', opacity, transform: [{ scaleX }, { scaleY }] }}>
      <LinearGradient
        colors={['rgba(111,163,255,0)', 'rgba(140,90,255,0.45)', 'rgba(99,120,255,0.75)', 'rgba(111,163,255,0.95)']}
        locations={[0, 0.45, 0.7, 1]}
        style={{ width: 520, height: 220, borderRadius: 260 }}
      />
      <LinearGradient
        colors={['rgba(190,160,255,0)', 'rgba(190,160,255,0.9)']}
        style={{ position: 'absolute', bottom: 30, width: 260, height: 90, borderRadius: 130 }}
      />
      <LinearGradient colors={['rgba(11,12,15,0)', colors.surface]} locations={[0, 0.55]} style={{ position: 'absolute', left: 0, right: 0, bottom: -120, height: 120 }} />
    </Animated.View>
  );
}
