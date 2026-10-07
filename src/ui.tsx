import { Pressable, StyleSheet, Text, View, type PressableProps, type ViewStyle } from 'react-native';
import { colors, control, radius, space, text } from './theme';

type ButtonProps = PressableProps & { label: string; kind?: 'primary' | 'secondary' | 'destructive'; onSurface?: boolean };

export function Button({ label, kind = 'primary', onSurface, style, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        styles.button,
        kind === 'primary' && { backgroundColor: colors.accent },
        kind === 'secondary' && { backgroundColor: onSurface ? colors.surface : colors.surfaceRaised },
        pressed && styles.pressed,
        rest.disabled && styles.disabled,
        style as ViewStyle,
      ]}
    >
      <Text style={[styles.buttonText, kind === 'primary' && { color: colors.onAccent }, kind === 'destructive' && { color: colors.recording }]}>{label}</Text>
    </Pressable>
  );
}

type ControlProps = PressableProps & { kind: 'record' | 'stop'; big?: boolean; label: string };

export function Control({ kind, big, label, ...rest }: ControlProps) {
  const size = big ? control.big : control.size;
  return (
    <View style={styles.controlWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        {...rest}
        style={({ pressed }) => [
          { width: size, height: size, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
          { backgroundColor: kind === 'stop' ? colors.recording : colors.surfaceRaised },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}
      >
        {kind === 'record'
          ? <View style={{ width: big ? 32 : 22, height: big ? 32 : 22, borderRadius: radius.pill, backgroundColor: colors.recording }} />
          : <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: colors.onRecording }} />}
      </Pressable>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {children}
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: { paddingTop: 64, paddingHorizontal: space[6], gap: space[6] },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 36, alignItems: 'center' },
  stack: { gap: space[3] },
  title: { ...text.title, color: colors.text },
  heading: { ...text.heading, color: colors.text },
  bodyText: { ...text.body, color: colors.text },
  meta: { ...text.meta, color: colors.textMuted },
  label: { ...text.label, color: colors.textMuted },
  button: { height: control.button, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[6] },
  buttonText: { ...text.button, color: colors.text },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  disabled: { opacity: 0.4 },
  controlWrap: { alignItems: 'center', gap: space[2] },
  input: { height: control.button, borderRadius: radius.pill, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, color: colors.text, ...text.body },
  inputFocused: { borderWidth: 2, borderColor: colors.accent },
  card: { backgroundColor: colors.surfaceRaised, borderRadius: radius.card, paddingVertical: space[4], paddingHorizontal: 20, gap: space[1] },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surfaceRaised, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingTop: space[3], paddingHorizontal: space[6], paddingBottom: 40, gap: space[6] },
  handle: { width: 36, height: 4, borderRadius: radius.pill, backgroundColor: colors.border, alignSelf: 'center' },
});
