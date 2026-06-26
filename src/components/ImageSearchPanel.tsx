import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ImageResult, MissingApiKeyError, searchImages } from '../services/imageProviders';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 420);

interface Props {
  visible: boolean;
  keyword: string;
  onClose: () => void;
  onSelect: (result: ImageResult) => void;
}

export default function ImageSearchPanel({ visible, keyword, onClose, onSelect }: Props) {
  const [query, setQuery] = useState(keyword);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorKind, setErrorKind] = useState<'none' | 'missing-key' | 'generic'>('none');

  const translateX = useSharedValue(PANEL_WIDTH);
  const requestId = useRef(0);

  useEffect(() => {
    translateX.value = withTiming(visible ? 0 : PANEL_WIDTH, { duration: 240 });
  }, [visible, translateX]);

  const runSearch = useCallback(async (searchQuery: string, pageToLoad: number, reset: boolean) => {
    const thisRequest = ++requestId.current;
    setLoading(true);
    setErrorKind('none');
    try {
      const { results: pageResults, hasMore: more } = await searchImages(searchQuery, pageToLoad);
      if (thisRequest !== requestId.current) return; // a newer search superseded this one
      setResults((prev) => (reset ? pageResults : [...prev, ...pageResults]));
      setHasMore(more);
      setPage(pageToLoad);
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      if (err instanceof MissingApiKeyError) {
        setErrorKind('missing-key');
      } else {
        setErrorKind('generic');
      }
      if (reset) setResults([]);
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setQuery(keyword);
      runSearch(keyword, 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, keyword]);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (trimmed) runSearch(trimmed, 1, true);
  };

  const handleEndReached = () => {
    if (!loading && hasMore && errorKind === 'none') {
      runSearch(query, page + 1, false);
    }
  };

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.overlayContainer, !visible && styles.touchDisabled]} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.panel, { width: PANEL_WIDTH }, panelStyle]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search images</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            placeholder="Search for an image"
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>

        {errorKind === 'missing-key' && (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>No image provider configured</Text>
            <Text style={styles.noticeBody}>
              Add a free Pixabay key as EXPO_PUBLIC_PIXABAY_KEY in your .env file (see README), then
              reload the app.
            </Text>
          </View>
        )}

        {errorKind === 'generic' && (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Search failed</Text>
            <Text style={styles.noticeBody}>Check your connection and try again.</Text>
          </View>
        )}

        {errorKind === 'none' && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.column}
            onEndReachedThreshold={0.4}
            onEndReached={handleEndReached}
            renderItem={({ item }) => (
              <Pressable style={styles.thumbWrap} onPress={() => onSelect(item)}>
                <Image source={{ uri: item.thumbUrl }} style={styles.thumb} resizeMode="cover" />
              </Pressable>
            )}
            ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} /> : null}
            ListEmptyComponent={
              !loading ? <Text style={styles.emptyText}>No results yet</Text> : null
            }
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  touchDisabled: {},
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingTop: 56,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: -4, height: 0 },
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  closeIcon: { fontSize: 18, color: '#8E8E93', padding: 4 },
  searchRow: { paddingHorizontal: 20, marginBottom: 14 },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  column: { gap: 10 },
  thumbWrap: {
    flex: 1,
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
  },
  thumb: { width: '100%', height: '100%' },
  loader: { marginVertical: 20 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 40 },
  notice: { paddingHorizontal: 20, paddingTop: 8 },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  noticeBody: { fontSize: 13, color: '#636366', lineHeight: 18 },
});
