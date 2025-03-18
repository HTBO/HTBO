import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Sample data for groups
const GROUPS = [
  {
    id: '1',
    name: 'FIFA Weekend Squad',
    lastMessage: "Is everyone ready for tonight's match?",
    time: '12:42 PM',
    unread: 3,
    avatar: "",
  },
  {
    id: '2',
    name: 'Rocket League Team',
    lastMessage: "I'll be online in 10 minutes",
    time: '11:20 AM',
    unread: 0,
    avatar: "",
  },
  {
    id: '3',
    name: 'Fortnite Pros',
    lastMessage: "Let's drop at Tilted Towers",
    time: 'Yesterday',
    unread: 0,
    avatar: "",
  },
  {
    id: '4',
    name: 'College Gaming Club',
    lastMessage: 'Tournament is scheduled for Saturday',
    time: 'Yesterday',
    unread: 5,
    avatar: "",
  },
  {
    id: '5',
    name: 'Among Us Crew',
    lastMessage: 'I saw Red vent!',
    time: 'Monday',
    unread: 0,
    avatar: "",
  },
];

export default function GroupsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredGroups = GROUPS.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleGroupPress = (groupId: string) => {
    router.push({
      pathname: '/group/[id]',
      params: { id: groupId }
    });
  };
  
  const renderGroupItem = ({ item }: { item: typeof GROUPS[number] }) => (
    <TouchableOpacity 
      style={styles.groupItem} 
      onPress={() => handleGroupPress(item.id)}
      activeOpacity={0.7}
    >
      <Image  style={styles.groupAvatar} />
      
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupTime}>{item.time}</Text>
        </View>
        
        <View style={styles.groupFooter}>
          <Text 
            style={styles.lastMessage} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.lastMessage}
          </Text>
          
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity 
          style={styles.newGroupButton}
          onPress={() => router.push('/create-group')}
        >
          <Ionicons name="add-circle" size={28} color="#7C3AED" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredGroups}
        keyExtractor={item => item.id}
        renderItem={renderGroupItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  newGroupButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F2937',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  groupTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#7C3AED',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});