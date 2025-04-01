import React, { useState, useMemo } from 'react';
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

const FRIENDS = [
  {
    id: '1',
    name: 'Alex Johnson',
    status: 'Online',
    lastSeen: 'Now',
    avatar: "",
  },
  {
    id: '2',
    name: 'Riley Smith',
    status: 'Playing Rocket League',
    lastSeen: '10 minutes ago',
    avatar: "",
  },
  {
    id: '3',
    name: 'Taylor Williams',
    status: 'Offline',
    lastSeen: '2 hours ago',
    avatar: "",
  },
  {
    id: '4',
    name: 'Jordan Brown',
    status: 'Online',
    lastSeen: 'Now',
    avatar: "",
  },
  {
    id: '5',
    name: 'Casey Miller',
    status: 'Playing Fortnite',
    lastSeen: '30 minutes ago',
    avatar: "",
  },
];

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter friends and groups based on search query
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return FRIENDS;
    const query = searchQuery.toLowerCase().trim();
    return FRIENDS.filter(friend => 
      friend.name.toLowerCase().includes(query) || 
      friend.status.toLowerCase().includes(query)
    );
  }, [searchQuery]);
  
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return GROUPS;
    const query = searchQuery.toLowerCase().trim();
    return GROUPS.filter(group => 
      group.name.toLowerCase().includes(query) || 
      group.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery]);
  
  const handleGroupPress = (groupId: string) => {
    router.push({
      pathname: '/group/[id]',
      params: { id: groupId }
    });
  };

  const handleFriendPress = (friendId: string) => {
    router.push({
      pathname: '/friend/[id]',
      params: { id: friendId }
    });
  };
  
  const renderGroupItem = ({ item }: { item: typeof GROUPS[number] }) => (
    <TouchableOpacity 
      style={styles.listItem} 
      onPress={() => handleGroupPress(item.id)}
      activeOpacity={0.7}
    >
      <Image style={styles.avatar} />
      
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
        
        <View style={styles.itemFooter}>
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

  const renderFriendItem = ({ item }: { item: typeof FRIENDS[number] }) => (
    <TouchableOpacity 
      style={styles.listItem} 
      onPress={() => handleFriendPress(item.id)}
      activeOpacity={0.7}
    >
      <Image style={styles.avatar} />
      
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemTime}>{item.lastSeen}</Text>
        </View>
        
        <View style={styles.itemFooter}>
          <Text 
            style={[
              styles.lastMessage, 
              item.status === 'Online' && styles.onlineStatus
            ]} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push(activeTab === 'friends' ? '/add-friend' : '/create-group')}
        >
          <Ionicons name="add-circle" size={32} color="#7C3AED" />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab === 'friends' ? 'friends' : 'groups'}...`}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'friends' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'friends' && styles.activeTabText
          ]}>Friends</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'groups' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'groups' && styles.activeTabText
          ]}>Groups</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'friends' ? (
        <FlatList
          data={filteredFriends}
          keyExtractor={item => item.id}
          renderItem={renderFriendItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No friends found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={item => item.id}
          renderItem={renderGroupItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No groups found</Text>
            </View>
          }
        />
      )}
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
  actionButton: {
    padding: 8,  // Increased from 4 to 8
    marginLeft: 8, // Add some margin for extra space
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#374151',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F2937',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  itemTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  itemFooter: {
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
  onlineStatus: {
    color: '#34D399',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: 'white',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});