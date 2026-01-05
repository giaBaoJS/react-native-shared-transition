/**
 * List item component for menu screens
 */

import { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Text } from './Text';
import { Colors } from './Colors';

interface ListItemProps {
  label: string;
  description?: string;
  image?: ImageSourcePropType;
  data?: any;
  onPress?: (data?: any) => void;
}

export function ListItem({
  label,
  description,
  image,
  data,
  onPress,
}: ListItemProps) {
  const handlePress = useCallback(() => {
    onPress?.(data);
  }, [onPress, data]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={handlePress}
    >
      {image && <Image style={styles.image} source={image} />}
      <View style={styles.content}>
        <Text large>{label}</Text>
        {description && (
          <Text small muted style={styles.description}>
            {description}
          </Text>
        )}
      </View>
      {onPress && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.back,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: Colors.empty,
  },
  content: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textLight,
    marginLeft: 8,
  },
});

export default ListItem;
