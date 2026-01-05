/**
 * Root Navigator using React Navigation Native Stack
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { DemoScreen } from '../screens/DemoScreen';
import { DebugScreen } from '../screens/DebugScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Heroes',
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }) => ({
          title: route.params.hero.name,
        })}
      />
      <Stack.Screen
        name="Demo"
        component={DemoScreen}
        options={{
          title: 'Transition Demo',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Debug"
        component={DebugScreen}
        options={{
          title: '🔧 Debug Native Module',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
