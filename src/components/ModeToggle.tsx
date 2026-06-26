import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EditorMode } from '../state/useEditorStore';

interface Props {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
}

/** Apple-style segmented control for switching between Edit and Preview. */
export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <View style={styles.track}>
      {(['edit', 'preview'] as const).map((option) => {
        const active = mode === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option === 'edit' ? 'Edit' : 'Preview'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 2,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  label: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  labelActive: { color: '#1C1C1E' },
});
