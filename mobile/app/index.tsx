import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { Redirect, router } from 'expo-router';

export default function IndexPage() {

  return <Redirect href="/login" />;
}

