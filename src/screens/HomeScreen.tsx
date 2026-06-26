import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import TemplateCard from '../components/TemplateCard';
import { templates } from '../data/templates';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>EduChart AI</Text>
        <Text style={styles.subtitle}>Pick a template to start designing</Text>
      </View>
      <FlatList
        data={templates}
        keyExtractor={(t) => t.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TemplateCard
            template={item}
            onPress={() => navigation.navigate('Editor', { templateId: item.id })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  headerBlock: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 30, fontWeight: '700', color: '#1C1C1E' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { gap: 14, marginBottom: 14 },
});
