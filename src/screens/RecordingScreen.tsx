import { BlurView } from 'expo-blur';
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

// The "still recording" signal: a full-width glow rising from the bottom
// edge like a horizon, blue into violet, blurred, with two soft lights that
// drift across it. Holds still under a sheet and under reduced motion.
function Aurora({ active }: { active: boolean }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active || reduce) return;
      loop = Animated.loop(Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      loop.start();
    });
    return () => loop?.stop();
  }, [active, t]);

  const rise = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const glow = t.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const driftLeft = t.interpolate({ inputRange: [0, 1], outputRange: [-40, 40] });
  const driftRight = t.interpolate({ inputRange: [0, 1], outputRange: [30, -30] });

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 340, overflow: 'hidden' }}>
      <Animated.View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 340, opacity: glow, transform: [{ scaleY: rise }], transformOrigin: 'bottom' }}>
        <LinearGradient
          colors={['rgba(11,12,15,0)', 'rgba(99,120,255,0.18)', 'rgba(140,90,255,0.45)', 'rgba(111,163,255,0.85)', 'rgba(150,190,255,1)']}
          locations={[0, 0.35, 0.6, 0.85, 1]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 340 }}
        />
        <Animated.View style={{ position: 'absolute', left: 40, bottom: -60, width: 260, height: 200, borderRadius: 130, backgroundColor: 'rgba(190,160,255,0.55)', transform: [{ translateX: driftLeft }] }} />
        <Animated.View style={{ position: 'absolute', right: 20, bottom: -40, width: 220, height: 160, borderRadius: 110, backgroundColor: 'rgba(111,163,255,0.5)', transform: [{ translateX: driftRight }] }} />
      </Animated.View>
      <BlurView intensity={70} tint="dark" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 340 }} />
      <LinearGradient colors={['rgba(11,12,15,0)', colors.surface]} locations={[0.3, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 }} />
    </View>
  );
}
