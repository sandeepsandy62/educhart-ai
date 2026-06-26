import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Layer } from '../types/template';
import { EditorMode } from '../state/useEditorStore';

interface Props {
  layer: Layer;
  scale: number;
  mode: EditorMode;
  onPressPlaceholder?: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

/**
 * Renders one layer (image placeholder, text, or shape) and, in edit mode,
 * makes it draggable. A bare tap (no movement) on an image placeholder opens
 * the search panel instead of starting a drag — Gesture.Race resolves which
 * one the touch meant.
 */
export default function LayerView({
  layer,
  scale,
  mode,
  onPressPlaceholder,
  onDragEnd,
}: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const originX = useSharedValue(layer.x);
  const originY = useSharedValue(layer.y);

  useEffect(() => {
    originX.value = layer.x;
    originY.value = layer.y;
    translateX.value = 0;
    translateY.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer.x, layer.y]);

  const isPlaceholder = layer.type === 'image-placeholder';

  const pan = Gesture.Pan()
    .enabled(mode === 'edit')
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const nextX = originX.value + translateX.value / scale;
      const nextY = originY.value + translateY.value / scale;
      originX.value = nextX;
      originY.value = nextY;
      translateX.value = 0;
      translateY.value = 0;
      runOnJS(onDragEnd)(layer.id, nextX, nextY);
    });

  const tap = Gesture.Tap()
    .enabled(mode === 'edit' && isPlaceholder)
    .maxDistance(8)
    .onEnd(() => {
      if (onPressPlaceholder) runOnJS(onPressPlaceholder)(layer.id);
    });

  const composed = Gesture.Race(tap, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const positionStyle = {
    position: 'absolute' as const,
    left: layer.x * scale,
    top: layer.y * scale,
    width: layer.width * scale,
    height: layer.height * scale,
  };

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[positionStyle, animatedStyle]}>
        {renderContent(layer, mode, scale)}
      </Animated.View>
    </GestureDetector>
  );
}

function renderContent(layer: Layer, mode: EditorMode, scale: number) {
  if (layer.type === 'image-placeholder') {
    const radius = (layer.borderRadius ?? 0) * scale;
    if (layer.imageUri) {
      return (
        <Image
          source={{ uri: layer.imageUri }}
          style={[styles.fill, { borderRadius: radius }]}
          resizeMode="cover"
        />
      );
    }
    return (
      <View
        style={[
          styles.fill,
          styles.placeholder,
          { borderRadius: radius },
          mode === 'preview' && styles.placeholderPreview,
        ]}
      >
        {mode === 'edit' && (
          <>
            <Text style={styles.placeholderIcon}>+</Text>
            <Text style={styles.placeholderLabel} numberOfLines={1}>
              {layer.keyword}
            </Text>
          </>
        )}
      </View>
    );
  }

  if (layer.type === 'text') {
    return (
      <Text
        style={{
          fontSize: layer.fontSize * scale,
          fontWeight: layer.fontWeight ?? '400',
          color: layer.color,
          textAlign: layer.align ?? 'left',
          width: '100%',
        }}
      >
        {layer.text}
      </Text>
    );
  }

  // shape layer
  if (layer.shape === 'star') {
    return (
      <Text style={{ fontSize: layer.width * scale * 0.9, color: layer.fill, lineHeight: layer.height * scale }}>
        ★
      </Text>
    );
  }
  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: layer.fill,
          borderRadius:
            layer.shape === 'circle'
              ? (layer.width * scale) / 2
              : (layer.borderRadius ?? 0) * scale,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  placeholder: {
    borderWidth: 2,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderPreview: {
    borderWidth: 0,
    backgroundColor: '#E5E5EA',
  },
  placeholderIcon: { fontSize: 28, color: '#8E8E93', fontWeight: '300' },
  placeholderLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
});
