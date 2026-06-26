import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import LayerView from './LayerView';
import { Layer, Template } from '../types/template';
import { EditorMode } from '../state/useEditorStore';

interface Props {
  template: Template;
  layers: Layer[];
  mode: EditorMode;
  onPressPlaceholder: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

/**
 * Scales the template's design-space canvas (e.g. 1000x1400) to fit the
 * available width while keeping every layer's aspect ratio and relative
 * position intact — the same JSON renders correctly on any screen size.
 */
export default function EditorCanvas({
  template,
  layers,
  mode,
  onPressPlaceholder,
  onDragEnd,
}: Props) {
  const [availableWidth, setAvailableWidth] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    setAvailableWidth(e.nativeEvent.layout.width);
  };

  const scale = availableWidth > 0 ? availableWidth / template.canvasWidth : 0;

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      {scale > 0 && (
        <View
          style={[
            styles.canvas,
            {
              width: template.canvasWidth * scale,
              height: template.canvasHeight * scale,
              backgroundColor: template.background,
            },
          ]}
        >
          {layers.map((layer) => (
            <LayerView
              key={layer.id}
              layer={layer}
              scale={scale}
              mode={mode}
              onPressPlaceholder={onPressPlaceholder}
              onDragEnd={onDragEnd}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  canvas: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
