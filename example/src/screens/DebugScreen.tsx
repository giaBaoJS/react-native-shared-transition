/**
 * Debug Screen
 *
 * Test native module functionality:
 * - measureNode()
 * - captureSnapshot()
 * - SharedElementRegistry
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {
  SharedElement,
  SharedElementRegistry,
  measureNode,
  captureSnapshot,
  isNativeModuleAvailable,
  isUsingNitro,
  getModuleType,
  type SharedElementNode,
} from 'react-native-shared-transition';

import { Heroes } from '../assets';

export function DebugScreen() {
  const hero = Heroes[0]; // Use first hero for testing
  const [node, setNode] = useState<SharedElementNode | null>(null);
  const [measureResult, setMeasureResult] = useState<any>(null);
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
  const [registryInfo, setRegistryInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get module info
  const moduleType = getModuleType();
  const moduleAvailable = isNativeModuleAvailable();
  const usingNitro = isUsingNitro();

  // Handle node registration
  const handleNode = useCallback((n: SharedElementNode | null) => {
    setNode(n);
    console.log('[Debug] Node registered:', n);
  }, []);

  // Update registry info
  const updateRegistryInfo = useCallback(() => {
    const debugInfo = SharedElementRegistry.debugGetAll();
    const entries: string[] = [];
    debugInfo.forEach((nodes, id) => {
      entries.push(`${id}: ${nodes.length} node(s)`);
      nodes.forEach((n, i) => {
        entries.push(`  [${i}] nativeId: ${n.nativeId}`);
      });
    });
    setRegistryInfo(entries.join('\n') || 'No elements registered');
  }, []);

  // Test measureNode
  const testMeasureNode = useCallback(async () => {
    if (!node) {
      Alert.alert(
        'Error',
        'No node registered. Wait for SharedElement to mount.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setMeasureResult(null);

    try {
      console.log('[Debug] Calling measureNode with:', node.nativeId);
      const result = await measureNode(node.nativeId);
      console.log('[Debug] measureNode result:', result);
      setMeasureResult(result);
    } catch (err: any) {
      console.error('[Debug] measureNode error:', err);
      setError(`measureNode failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [node]);

  // Test captureSnapshot
  const testCaptureSnapshot = useCallback(async () => {
    if (!node) {
      Alert.alert(
        'Error',
        'No node registered. Wait for SharedElement to mount.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSnapshotUri(null);

    try {
      console.log('[Debug] Calling captureSnapshot with:', node.nativeId);
      const uri = await captureSnapshot(node.nativeId);
      console.log('[Debug] captureSnapshot result:', uri);
      setSnapshotUri(uri);
    } catch (err: any) {
      console.error('[Debug] captureSnapshot error:', err);
      setError(`captureSnapshot failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [node]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Module Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Native Module Status</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Available:</Text>
          <Text
            style={[
              styles.infoValue,
              moduleAvailable ? styles.success : styles.error,
            ]}
          >
            {moduleAvailable ? '✅ Yes' : '❌ No'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Module Type:</Text>
          <Text style={styles.infoValue}>{moduleType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Using Nitro:</Text>
          <Text style={styles.infoValue}>
            {usingNitro ? '✅ Yes' : '❌ No (TurboModule)'}
          </Text>
        </View>
      </View>

      {/* Test Element */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖼️ Test SharedElement</Text>
        <View style={styles.testElement}>
          <SharedElement id={`debug.${hero.id}`} onNode={handleNode}>
            <Image source={hero.photo} style={styles.testImage} />
          </SharedElement>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Node ID:</Text>
          <Text style={styles.infoValue}>
            {node?.nativeId || 'Not registered'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Transition ID:</Text>
          <Text style={styles.infoValue}>{node?.transitionId || '-'}</Text>
        </View>
      </View>

      {/* Registry Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 SharedElementRegistry</Text>
        <TouchableOpacity style={styles.button} onPress={updateRegistryInfo}>
          <Text style={styles.buttonText}>Refresh Registry Info</Text>
        </TouchableOpacity>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>
            {registryInfo || 'Press button to load'}
          </Text>
        </View>
      </View>

      {/* Test measureNode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📐 Test measureNode()</Text>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={testMeasureNode}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Run measureNode()'}
          </Text>
        </TouchableOpacity>
        {measureResult && (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {JSON.stringify(measureResult, null, 2)}
            </Text>
          </View>
        )}
      </View>

      {/* Test captureSnapshot */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Test captureSnapshot()</Text>
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={testCaptureSnapshot}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Run captureSnapshot()'}
          </Text>
        </TouchableOpacity>
        {snapshotUri && (
          <View style={styles.snapshotResult}>
            <Text style={styles.infoLabel}>Snapshot URI:</Text>
            <Text style={styles.codeText} numberOfLines={2}>
              {snapshotUri}
            </Text>
            <Image
              source={{ uri: snapshotUri }}
              style={styles.snapshotPreview}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorTitle}>⚠️ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Instructions</Text>
        <Text style={styles.instructionText}>
          1. Check if native module is available{'\n'}
          2. Click "Refresh Registry Info" to see registered elements{'\n'}
          3. Click "Run measureNode()" to test layout measurement{'\n'}
          4. Click "Run captureSnapshot()" to test view capture{'\n'}
          5. Check console logs for detailed output
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  success: {
    color: '#27ae60',
  },
  error: {
    color: '#e74c3c',
  },
  testElement: {
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  testImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#27ae60',
  },
  secondaryButton: {
    backgroundColor: '#9b59b6',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#ecf0f1',
  },
  snapshotResult: {
    marginTop: 12,
  },
  snapshotPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
  },
  errorSection: {
    backgroundColor: '#fdf2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c0392b',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default DebugScreen;
