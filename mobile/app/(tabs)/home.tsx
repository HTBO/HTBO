import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HTBO App</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>What would you like to do today?</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Feature Card 1 */}
          <TouchableOpacity style={styles.card}>
            <View style={[styles.cardIcon, { backgroundColor: '#4F46E5' }]}>
              <Ionicons name="calendar-outline" size={28} color="white" />
            </View>
            <Text style={styles.cardTitle}>My Schedule</Text>
            <Text style={styles.cardDescription}>View upcoming appointments and events</Text>
          </TouchableOpacity>

          {/* Feature Card 2 */}
          <TouchableOpacity style={styles.card}>
            <View style={[styles.cardIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="document-text-outline" size={28} color="white" />
            </View>
            <Text style={styles.cardTitle}>Documents</Text>
            <Text style={styles.cardDescription}>Access important files and records</Text>
          </TouchableOpacity>

          {/* Feature Card 3 */}
          <TouchableOpacity style={styles.card}>
            <View style={[styles.cardIcon, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="white" />
            </View>
            <Text style={styles.cardTitle}>Messages</Text>
            <Text style={styles.cardDescription}>Check your inbox and notifications</Text>
          </TouchableOpacity>

          {/* Feature Card 4 */}
          <TouchableOpacity style={styles.card}>
            <View style={[styles.cardIcon, { backgroundColor: '#EC4899' }]}>
              <Ionicons name="settings-outline" size={28} color="white" />
            </View>
            <Text style={styles.cardTitle}>Settings</Text>
            <Text style={styles.cardDescription}>Configure your app preferences</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    padding: 8,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});