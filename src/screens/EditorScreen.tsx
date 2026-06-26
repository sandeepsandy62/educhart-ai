import React, { useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import EditorCanvas from '../components/EditorCanvas';
import ImageSearchPanel from '../components/ImageSearchPanel';
import ModeToggle from '../components/ModeToggle';
import { getTemplateById } from '../data/templates';
import { useEditorStore } from '../state/useEditorStore';
import { isImagePlaceholder } from '../types/template';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Editor'>;

export default function EditorScreen({ route, navigation }: Props) {
  const { templateId } = route.params;
  const template = useEditorStore((s) => s.template);
  const layers = useEditorStore((s) => s.layers);
  const mode = useEditorStore((s) => s.mode);
  const activeSearchLayerId = useEditorStore((s) => s.activeSearchLayerId);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const setMode = useEditorStore((s) => s.setMode);
  const updateLayerPosition = useEditorStore((s) => s.updateLayerPosition);
  const openSearchFor = useEditorStore((s) => s.openSearchFor);
  const closeSearch = useEditorStore((s) => s.closeSearch);
  const setLayerImage = useEditorStore((s) => s.setLayerImage);

  useEffect(() => {
    const t = getTemplateById(templateId);
    if (t) loadTemplate(t);
  }, [templateId, loadTemplate]);

  if (!template) return null;

  const activeLayer = layers.find((l) => l.id === activeSearchLayerId);
  const activeKeyword =
    activeLayer && isImagePlaceholder(activeLayer) ? activeLayer.keyword : '';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {template.name}
        </Text>
        <ModeToggle mode={mode} onChange={setMode} />
      </View>

      <EditorCanvas
        template={template}
        layers={layers}
        mode={mode}
        onPressPlaceholder={openSearchFor}
        onDragEnd={updateLayerPosition}
      />

      <ImageSearchPanel
        visible={!!activeSearchLayerId}
        keyword={activeKeyword}
        onClose={closeSearch}
        onSelect={(result) => {
          if (activeSearchLayerId) {
            setLayerImage(activeSearchLayerId, result.fullUrl, result.attribution);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backIcon: { fontSize: 30, color: '#007AFF', width: 20 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
});
