/**
 * Home Screen - List of Heroes
 */

import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { SharedElement } from 'react-native-shared-transition';

import { Heroes } from '../assets';
import type { Hero } from '../types';
import type { HomeScreenProps } from '../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH / 2 - 24;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const handlePress = useCallback(
    (hero: Hero) => {
      navigation.navigate('Detail', { hero });
    },
    [navigation]
  );

  const handleLongPress = useCallback(
    (hero: Hero) => {
      // Long press to open demo screen
      navigation.navigate('Demo', { hero });
    },
    [navigation]
  );

  const handleDebugPress = useCallback(() => {
    navigation.navigate('Debug');
  }, [navigation]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚀 Shared Transition Demo</Text>
        <Text style={styles.headerSubtitle}>
          Tap a card to see Detail Screen{'\n'}
          Long press to see Transition Demo
        </Text>

        {/* Debug Button */}
        <TouchableOpacity style={styles.debugButton} onPress={handleDebugPress}>
          <Text style={styles.debugButtonText}>🔧 Debug Native Module</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleDebugPress]
  );

  const renderItem = useCallback(
    ({ item }: { item: Hero }) => (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.9}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={300}
      >
        <SharedElement id={`hero.${item.id}.photo`}>
          <Image source={item.photo} style={styles.image} resizeMode="cover" />
        </SharedElement>

        <View style={styles.nameContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.hint}>Long press for demo</Text>
        </View>
      </TouchableOpacity>
    ),
    [handlePress, handleLongPress]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={Heroes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  debugButton: {
    marginTop: 12,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 12,
  },
  item: {
    width: ITEM_WIDTH,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: ITEM_WIDTH,
  },
  nameContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hint: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 4,
  },
});
