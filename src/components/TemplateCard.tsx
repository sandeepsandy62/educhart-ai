import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Template } from '../types/template';

interface Props {
  template: Template;
  onPress: () => void;
}

/** Pinterest-style card for the home grid. Uses a color swatch + initial
 * as the thumbnail for now — real rendered previews can replace this once
 * templates are filled in, without changing the grid layout. */
export default function TemplateCard({ template, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.swatch, { backgroundColor: template.accentColor }]}>
        <Text style={styles.swatchLetter}>{template.name.charAt(0)}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.name} numberOfLines={1}>
          {template.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {template.category}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  swatch: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLetter: {
    fontSize: 40,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  meta: { padding: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  category: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
});
