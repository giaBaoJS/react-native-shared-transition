/**
 * Tiles Screen - Grid of heroes with shared element transitions
 */

import { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SharedElement } from 'react-native-shared-transition';
import type { SharedElementsConfig } from 'react-native-shared-transition';
import { NavBar, Text, Colors, Shadows, Router } from '../components';
import { Heroes } from '../assets';
import type { Hero } from '../types';
import { DetailScreen } from './DetailScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type TileType = 'tile' | 'card' | 'card2' | 'avatar';

interface TilesScreenProps {
  type: TileType;
  title: string;
}

export function TilesScreen({ type, title }: TilesScreenProps) {
  const [dimensions, setDimensions] = useState({
    width: SCREEN_WIDTH,
    height: Dimensions.get('window').height,
  });

  const onLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }, []);

  const numColumns = type === 'tile' ? 2 : type === 'avatar' ? 3 : 1;

  const handlePress = useCallback(
    (hero: Hero) => {
      // Define shared elements configuration based on type
      let sharedElements: SharedElementsConfig = [];

      switch (type) {
        case 'tile':
          sharedElements = [
            `heroPhoto.${hero.id}`,
          ];
          break;
        case 'avatar':
          sharedElements = [
            { id: `heroPhoto.${hero.id}`, animation: 'move' },
            { id: `heroBackground.${hero.id}`, otherId: `heroPhoto.${hero.id}`, animation: 'fade-in' },
            { id: `heroName.${hero.id}`, otherId: `heroPhoto.${hero.id}`, animation: 'fade-in' },
          ];
          break;
        case 'card':
          sharedElements = [
            `heroBackground.${hero.id}`,
            `heroPhoto.${hero.id}`,
            `heroName.${hero.id}`,
            { id: `heroDescription.${hero.id}`, animation: 'fade', resize: 'clip', align: 'left-top' },
          ];
          break;
        case 'card2':
          sharedElements = [
            `heroBackground.${hero.id}`,
            `heroPhoto.${hero.id}`,
            { id: `heroOverlay.${hero.id}`, animation: 'fade' },
            { id: `heroName.${hero.id}`, animation: 'fade' },
            { id: `heroQuote.${hero.id}`, animation: 'fade' },
          ];
          break;
      }

      Router.push(<DetailScreen hero={hero} type={type} />, {
        sharedElements,
        duration: 400,
      });
    },
    [type]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Hero; index: number }) => {
      switch (type) {
        case 'tile':
          return <TileItem hero={item} index={index} width={dimensions.width} onPress={handlePress} />;
        case 'avatar':
          return <AvatarItem hero={item} width={dimensions.width} onPress={handlePress} />;
        case 'card':
          return <CardItem hero={item} onPress={handlePress} />;
        case 'card2':
          return <Card2Item hero={item} onPress={handlePress} />;
        default:
          return null;
      }
    },
    [type, dimensions.width, handlePress]
  );

  return (
    <View style={styles.container} onLayout={onLayout}>
      <NavBar
        title={title}
        back="back"
        onBack={() => Router.pop()}
      />

      <FlatList
        style={styles.list}
        contentContainerStyle={type === 'card' || type === 'card2' ? styles.cardListContent : undefined}
        data={Heroes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`list-${numColumns}`}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// =============================================================================
// Tile Item
// =============================================================================

function TileItem({
  hero,
  index,
  width,
  onPress,
}: {
  hero: Hero;
  index: number;
  width: number;
  onPress: (hero: Hero) => void;
}) {
  const tileWidth = width / 2;

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        { width: tileWidth },
        index % 2 === 0 ? styles.tileLeft : styles.tileRight,
      ]}
      activeOpacity={0.9}
      onPress={() => onPress(hero)}
    >
      <SharedElement id={`heroPhoto.${hero.id}`} style={styles.tileFlex}>
        <Image
          style={styles.tileImage}
          source={hero.photo}
          resizeMode="cover"
        />
      </SharedElement>
    </TouchableOpacity>
  );
}

// =============================================================================
// Avatar Item
// =============================================================================

function AvatarItem({
  hero,
  width,
  onPress,
}: {
  hero: Hero;
  width: number;
  onPress: (hero: Hero) => void;
}) {
  const avatarSize = width / 3 - 24;

  return (
    <TouchableOpacity
      style={styles.avatar}
      activeOpacity={0.9}
      onPress={() => onPress(hero)}
    >
      <SharedElement id={`heroPhoto.${hero.id}`}>
        <Image
          style={[styles.avatarImage, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
          source={hero.photo}
          resizeMode="cover"
        />
      </SharedElement>
      <Text small style={styles.avatarName} numberOfLines={1}>
        {hero.name}
      </Text>
    </TouchableOpacity>
  );
}

// =============================================================================
// Card Item
// =============================================================================

function CardItem({
  hero,
  onPress,
}: {
  hero: Hero;
  onPress: (hero: Hero) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.95}
      onPress={() => onPress(hero)}
    >
      <SharedElement
        id={`heroBackground.${hero.id}`}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.cardBackground} />
      </SharedElement>

      <SharedElement id={`heroPhoto.${hero.id}`}>
        <ImageBackground
          style={styles.cardImage}
          source={hero.photo}
          resizeMode="cover"
        />
      </SharedElement>

      <View style={styles.cardFooter}>
        <SharedElement id={`heroName.${hero.id}`} style={styles.cardNameContainer}>
          <Text xlarge style={styles.cardName}>{hero.name}</Text>
        </SharedElement>

        {hero.description && (
          <SharedElement id={`heroDescription.${hero.id}`} style={styles.cardDescContainer}>
            <Text small muted numberOfLines={2} style={styles.cardDesc}>
              {hero.description}
            </Text>
          </SharedElement>
        )}
      </View>
    </TouchableOpacity>
  );
}

// =============================================================================
// Card2 Item (Gradient Overlay)
// =============================================================================

function Card2Item({
  hero,
  onPress,
}: {
  hero: Hero;
  onPress: (hero: Hero) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card2Container}
      activeOpacity={0.95}
      onPress={() => onPress(hero)}
    >
      <SharedElement
        id={`heroBackground.${hero.id}`}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.card2Background} />
      </SharedElement>

      <SharedElement id={`heroPhoto.${hero.id}`}>
        <Image
          style={styles.card2Image}
          source={hero.photo}
          resizeMode="cover"
        />
      </SharedElement>

      {/* Gradient Overlay */}
      <SharedElement
        id={`heroOverlay.${hero.id}`}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.card2Overlay} />
      </SharedElement>

      {/* Content on top of gradient */}
      <View style={styles.card2Content}>
        <SharedElement id={`heroName.${hero.id}`} style={styles.card2NameContainer}>
          <Text xxlarge light style={styles.card2Name}>{hero.name}</Text>
        </SharedElement>

        {hero.quote && (
          <SharedElement id={`heroQuote.${hero.id}`} style={styles.card2QuoteContainer}>
            <Text small light numberOfLines={1} style={styles.card2Quote}>
              {hero.quote}
            </Text>
          </SharedElement>
        )}
      </View>
    </TouchableOpacity>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.empty,
  },
  list: {
    flex: 1,
  },
  cardListContent: {
    paddingVertical: 16,
  },

  // Tile styles
  tile: {
    height: 180,
    borderColor: Colors.empty,
  },
  tileLeft: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  tileRight: {
    borderBottomWidth: 1,
  },
  tileFlex: {
    flex: 1,
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },

  // Avatar styles
  avatar: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarImage: {
    backgroundColor: Colors.empty,
  },
  avatarName: {
    marginTop: 8,
    fontWeight: '600',
    color: Colors.text,
  },

  // Card styles
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.card,
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
  },
  cardImage: {
    height: 200,
    width: '100%',
  },
  cardFooter: {
    padding: 16,
  },
  cardNameContainer: {
    alignSelf: 'flex-start',
  },
  cardName: {
    fontWeight: '700',
    color: Colors.dark,
  },
  cardDescContainer: {
    marginTop: 6,
  },
  cardDesc: {
    lineHeight: 20,
  },

  // Card2 styles (gradient overlay)
  card2Container: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    height: 380,
    ...Shadows.large,
  },
  card2Background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dark,
    borderRadius: 24,
  },
  card2Image: {
    width: '100%',
    height: '100%',
  },
  card2Overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 24,
  },
  card2Content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 20,
    // Add gradient effect
    backgroundColor: 'transparent',
  },
  card2NameContainer: {
    alignSelf: 'flex-start',
  },
  card2Name: {
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card2QuoteContainer: {
    marginTop: 4,
  },
  card2Quote: {
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default TilesScreen;
