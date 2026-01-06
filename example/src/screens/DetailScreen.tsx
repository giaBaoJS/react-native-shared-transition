/**
 * Detail Screen - Hero Detail View
 */

import React from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { SharedElement } from 'react-native-shared-transition';

import type { DetailScreenProps } from '../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function DetailScreen({ route }: DetailScreenProps) {
  const { hero } = route.params;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <SharedElement id={`hero.${hero.id}.photo`}>
        <Image source={hero.photo} style={styles.image} resizeMode="cover" />
      </SharedElement>

      <View style={styles.content}>
        <Text style={styles.name}>{hero.name}</Text>

        {hero.quote && <Text style={styles.quote}>"{hero.quote}"</Text>}

        {hero.description && (
          <Text style={styles.description}>{hero.description}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.8,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
    marginBottom: 24,
  },
});
