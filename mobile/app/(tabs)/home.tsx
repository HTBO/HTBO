import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HTBO App</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to HTBO!</Text>
          <Text style={styles.welcomeSubtitle}>Your Gaming Social Hub</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Ionicons name="people-outline" size={32} color="#4F46E5" />
            <Text style={styles.featureTitle}>Connect with Friends</Text>
            <Text style={styles.featureDescription}>
              Add friends, create gaming groups, and build your gaming community
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="game-controller-outline" size={32} color="#10B981" />
            <Text style={styles.featureTitle}>Extensive Game Library</Text>
            <Text style={styles.featureDescription}>
              Browse and discover games from our vast collection of titles
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="calendar-outline" size={32} color="#F59E0B" />
            <Text style={styles.featureTitle}>Gaming Sessions</Text>
            <Text style={styles.featureDescription}>
              Schedule and organize gaming sessions with your friends and groups
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="search-outline" size={32} color="#EC4899" />
            <Text style={styles.featureTitle}>Find Players</Text>
            <Text style={styles.featureDescription}>
              Search for players with similar interests and gaming preferences
            </Text>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});