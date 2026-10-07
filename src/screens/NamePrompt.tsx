import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { Button, styles } from '../ui';

type Props = { busy: boolean; error: string | null; onConfirm: (title: string) => void; onCancel: () => void };

export function NamePrompt({ busy, error, onConfirm, onCancel }: Props) {
  const [title, setTitle] = useState('');
  return (
    <View style={[styles.screen, styles.body]} testID="screen-name">
      <Text style={styles.heading}>What is this meeting?</Text>
      <View style={styles.stack}>
        <Text style={styles.meta}>Meeting name</Text>
        <TextInput
          testID="meeting-name"
          autoFocus
          value={title}
          onChangeText={setTitle}
          placeholder="Leave blank to name it by time"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.inputFocused]}
          returnKeyType="done"
          onSubmitEditing={() => { if (!busy) onConfirm(title); }}
        />
        <Text style={styles.meta}>Recording is for your own notes. Tell the room.</Text>
        {error && <Text style={[styles.meta, { color: colors.recording }]} testID="error">{error}</Text>}
      </View>
      <View style={styles.stack}>
        <Button label="Start recording" testID="start-recording" disabled={busy} onPress={() => onConfirm(title)} />
        <Button label="Cancel" kind="secondary" disabled={busy} onPress={onCancel} />
      </View>
    </View>
  );
}
