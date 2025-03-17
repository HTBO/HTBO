import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create Screen</Text>
      <Text style={styles.subtext}>This screen is accessed via direct navigation.</Text>
      <Text style={styles.subtext}>The center button uses a custom action instead.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111827',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  subtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});