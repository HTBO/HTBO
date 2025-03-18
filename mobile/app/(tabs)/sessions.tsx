import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SessionsScreen() {
  
  const handleCardPress = (sessionId: string) => {
    router.push({
      pathname: "/session/[id]",
      params: { id: sessionId }
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sessions</Text>
      
      <ScrollView style={styles.scrollView}>
        <SessionCard 
          gameImage={require('@/assets/images/games/fifa.png')}
          gameTitle="FIFA 24"
          title="Friday Night Tournament" 
          date="Today, 8:00 PM" 
          participants={3}
          onPress={() => handleCardPress('session-001')}
        />
        
        <SessionCard 
          gameImage={require('@/assets/images/games/fortnite.png')}
          gameTitle="Fortnite"
          title="Squad Battle Royale" 
          date="Tomorrow, 4:30 PM" 
          participants={8}
          onPress={() => handleCardPress('session-002')}
        />
        
        <SessionCard 
          gameImage={require('@/assets/images/games/rocket-league.png')}
          gameTitle="Rocket League"
          title="Custom Match" 
          date="March 21, 10:00 AM" 
          participants={2}
          onPress={() => handleCardPress('session-003')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface SessionCardProps {
  gameImage: any; // Image source
  gameTitle: string;
  title: string;
  date: string;
  participants: number;
  onPress: () => void;
}

// Modified Session Card Component with image
const SessionCard = ({ gameImage, gameTitle, title, date, participants, onPress }: SessionCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Game Image */}
        <Image source={gameImage} style={styles.gameImage} />
        
        
        {/* Content */}
        <View style={styles.textContent}>
          {/* Game Title */}
          <Text style={styles.gameTitle}>{gameTitle}</Text>
          
          {/* Session Title */}
          <Text style={styles.cardTitle}>{title}</Text>
          
          {/* Session Details */}
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
        </View>
        
        {/* Arrow Icon */}
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={styles.arrowIcon} />
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  cardInfo: {
    gap: 6,
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
  arrowIcon: {
    marginLeft: 8,
  },
});