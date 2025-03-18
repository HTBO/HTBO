import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SessionsScreen() {
  
  const handleCardPress = (sessionId: string) => {
    // Navigate to a non-tab screen with the session ID
    router.push({
      pathname: "/session/[id]",
      params: { id: sessionId }
    });
  };

  
  return (
        
      <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sessions</Text>
      
      <ScrollView style={styles.scrollView}>
        {/* Sample Session Cards */}
        <SessionCard 
          title="Morning Workout" 
          date="Today, 8:00 AM" 
          participants={3}
          onPress={() => handleCardPress('session-001')}
        />
        
        <SessionCard 
          title="Team Training" 
          date="Tomorrow, 4:30 PM" 
          participants={8}
          onPress={() => handleCardPress('session-002')}
        />
        
        <SessionCard 
          title="Recovery Session" 
          date="March 21, 10:00 AM" 
          participants={2}
          onPress={() => handleCardPress('session-003')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface SessionCardProps {
    title: string;
    date: string;
    participants: number;
    onPress: () => void;
  }

// Session Card Component
const SessionCard = ({ title, date, participants, onPress }: SessionCardProps) => {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
        
        <View style={styles.cardInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
            <Text style={styles.infoText}>{date}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color="#9CA3AF" />
            <Text style={styles.infoText}>{participants} participants</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#111827',
  },
  scrollView: {
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cardInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});