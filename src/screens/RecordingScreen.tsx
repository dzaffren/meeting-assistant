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
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: between(slow, 0.8, 1) }]}>
        <LinearGradient
          colors={['rgba(60,70,160,0.35)', 'rgba(99,120,255,0.3)', 'rgba(140,90,255,0.5)', 'rgba(111,163,255,0.85)', 'rgba(150,190,255,1)']}
          locations={[0, 0.3, 0.6, 0.85, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={{ position: 'absolute', left: -40, top: 60, width: 300, height: 260, borderRadius: 150, backgroundColor: 'rgba(90,110,255,0.45)', transform: [{ translateX: between(mid, -30, 60) }, { translateY: between(slow, 0, 50) }] }} />
        <Animated.View style={{ position: 'absolute', right: -60, top: 240, width: 320, height: 280, borderRadius: 160, backgroundColor: 'rgba(170,120,255,0.5)', transform: [{ translateX: between(slow, 40, -50) }, { translateY: between(fast, -20, 20) }] }} />
        <Animated.View style={{ position: 'absolute', left: 20, bottom: 120, width: 300, height: 240, borderRadius: 150, backgroundColor: 'rgba(190,160,255,0.6)', transform: [{ translateX: between(fast, -60, 60) }, { translateY: between(mid, 10, -30) }] }} />
        <Animated.View style={{ position: 'absolute', right: 0, bottom: -40, width: 260, height: 200, borderRadius: 130, backgroundColor: 'rgba(120,200,255,0.5)', transform: [{ translateX: between(mid, 50, -40) }, { translateY: between(slow, 0, -24) }] }} />
      </Animated.View>
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(11,12,15,0.55)', 'rgba(11,12,15,0)']} locations={[0, 1]} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 180 }} />
    </View>
  );
}
