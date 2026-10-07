import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { Button, styles } from '../ui';

export function NamePrompt({ onConfirm, onCancel }: { onConfirm: (title: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
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
          onSubmitEditing={() => onConfirm(title)}
        />
        <Text style={styles.meta}>Recording is for your own notes. Tell the room.</Text>
      </View>
      <View style={styles.stack}>
        <Button label="Start recording" testID="start-recording" disabled={busy} onPress={() => { setBusy(true); onConfirm(title); }} />
        <Button label="Cancel" kind="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}
