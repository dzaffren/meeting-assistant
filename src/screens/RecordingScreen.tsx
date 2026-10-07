import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { State } from '../machine';
import { formatDuration } from '../name';
import { colors } from '../theme';
import { Button, Control, Sheet, styles } from '../ui';

type Live = Extract<State, { kind: 'recording' | 'stopSheet' | 'discardConfirm' }>;

type Props = {
  state: Live;
  busy: boolean;
  error: string | null;
  onStop: () => void;
  onKeep: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onCancelDiscard: () => void;
  onConfirmDiscard: () => void;
};

export function RecordingScreen({ state, busy, error, onStop, onKeep, onSave, onDiscard, onCancelDiscard, onConfirmDiscard }: Props) {
  const breathing = state.kind === 'recording';
  return (
    <View style={styles.screen} testID="screen-recording">
      <Aurora active={breathing} />
      <View style={{ paddingTop: 64, alignItems: 'center' }}>
        <Text style={styles.meta}>{state.title}</Text>
      </View>
      <View style={styles.bottom}>
        <Control kind="stop" label="Stop" onPress={onStop} testID="stop" />
      </View>

      {state.kind === 'stopSheet' && (
        <Sheet>
          <View style={{ gap: 8 }}>
            <Text style={styles.heading}>Stop and save?</Text>
            <Text style={[styles.bodyText, { color: colors.textMuted }]}>{state.title}, {formatDuration(Date.now() - state.startedAt)}.</Text>
            {error && <Text style={[styles.meta, { color: colors.recording }]} testID="error">{error}</Text>}
          </View>
          <View style={styles.stack}>
            <Button label={busy ? 'Saving' : 'Stop and save'} disabled={busy} onPress={onSave} testID="stop-and-save" />
            <Button label="Keep recording" kind="secondary" onSurface disabled={busy} onPress={onKeep} testID="keep-recording" />
            <Button label="Discard" kind="destructive" onSurface disabled={busy} onPress={onDiscard} testID="discard" />
          </View>
        </Sheet>
      )}

      {state.kind === 'discardConfirm' && (
        <Sheet>
          <View style={{ gap: 8 }}>
            <Text style={styles.heading}>Discard {formatDuration(state.durationMs)} of audio?</Text>
            <Text style={[styles.bodyText, { color: colors.textMuted }]}>This can't be undone.</Text>
            {error && <Text style={[styles.meta, { color: colors.recording }]} testID="error">{error}</Text>}
          </View>
          <View style={styles.stack}>
            <Button label="Discard" kind="destructive" onSurface disabled={busy} onPress={onConfirmDiscard} testID="confirm-discard" />
            <Button label="Cancel" kind="secondary" onSurface disabled={busy} onPress={onCancelDiscard} />
          </View>
        </Sheet>
      )}
    </View>
  );
}

// The "still recording" signal: a glow rising from the bottom edge like a
// horizon, blue into violet, with three soft lights drifting on their own
// clocks. The blur covers the whole screen so it has no visible edge. Holds
// still under a sheet and under reduced motion.
function useLoop(active: boolean, duration: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active || reduce) return;
      loop = Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      loop.start();
    });
    return () => loop?.stop();
  }, [active, duration, v]);
  return v;
}

const between = (v: Animated.Value, a: number, b: number) => v.interpolate({ inputRange: [0, 1], outputRange: [a, b] });

function Aurora({ active }: { active: boolean }) {
  const slow = useLoop(active, 4200);
  const mid = useLoop(active, 2900);
  const fast = useLoop(active, 2100);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={{ position: 'absolute', left: -60, right: -60, bottom: 0, height: 480, opacity: between(slow, 0.75, 1), transform: [{ scaleY: between(slow, 1, 1.1) }], transformOrigin: 'bottom' }}>
        <LinearGradient
          colors={['rgba(11,12,15,0)', 'rgba(99,120,255,0.12)', 'rgba(140,90,255,0.4)', 'rgba(111,163,255,0.8)', 'rgba(150,190,255,1)']}
          locations={[0, 0.45, 0.68, 0.88, 1]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 480 }}
        />
        <Animated.View style={{ position: 'absolute', left: 30, bottom: -70, width: 280, height: 220, borderRadius: 140, backgroundColor: 'rgba(190,160,255,0.6)', transform: [{ translateX: between(mid, -50, 50) }, { translateY: between(fast, 0, -18) }] }} />
        <Animated.View style={{ position: 'absolute', right: 10, bottom: -50, width: 240, height: 180, borderRadius: 120, backgroundColor: 'rgba(111,163,255,0.55)', transform: [{ translateX: between(slow, 40, -40) }, { translateY: between(mid, -12, 10) }] }} />
        <Animated.View style={{ position: 'absolute', left: 150, bottom: 20, width: 200, height: 140, borderRadius: 100, backgroundColor: 'rgba(120,200,255,0.35)', transform: [{ translateX: between(fast, -70, 70) }, { translateY: between(slow, 10, -24) }] }} />
      </Animated.View>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(11,12,15,0)', colors.surface]} locations={[0.25, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 160 }} />
    </View>
  );
}
