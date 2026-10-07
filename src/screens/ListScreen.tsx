import { FlatList, Text, View } from 'react-native';
import type { Meeting } from '../db';
import { formatDay, formatDuration } from '../name';
import { Control, styles } from '../ui';

export function ListScreen({ meetings, onRecord }: { meetings: Meeting[]; onRecord: () => void }) {
  const today = new Date();
  return (
    <View style={styles.screen} testID="screen-list">
      <FlatList
        data={meetings}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[styles.body, { paddingBottom: 180 }]}
        ListHeaderComponent={<Text style={styles.title}>Meetings</Text>}
        ListEmptyComponent={
          <View style={[styles.card, { alignItems: 'center' }]}>
            <Text style={[styles.bodyText, { fontWeight: '600' }]}>No meetings yet</Text>
            <Text style={styles.meta}>Tap record at the start of your next one.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`meeting-${item.id}`}>
            <Text style={[styles.bodyText, { fontWeight: '600' }]}>{item.title}</Text>
            <Text style={styles.meta}>{formatDay(item.startedAt, today)} · {formatDuration(item.durationMs)}</Text>
          </View>
        )}
      />
      <View style={styles.bottom}>
        <Control kind="record" big label="Record" onPress={onRecord} testID="record" />
      </View>
    </View>
  );
}
