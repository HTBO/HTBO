import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { UserModel } from "../models/UserModel";
import { Friend, FriendStatus } from "../models/FriendModel"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationService } from '../services/notificationService';
import { authService } from "../services/authService";

// Add this helper function
const normalizeId = (id: any): string => {
  if (!id) return "";
  // If it's an object with an _id field
  if (typeof id === "object" && id._id) return id._id.toString();
  // Otherwise convert to string
  return id.toString();
};

export default function AddFriendScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState<FriendStatus>({});
  const [addedFriends, setAddedFriends] = useState<FriendStatus>({}); // Track added friends
  const [isRemovingFriend, setIsRemovingFriend] = useState<FriendStatus>({});
  const [acceptedFriends, setAcceptedFriends] = useState<FriendStatus>({});

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData: any = await authService.getUserData();
        setCurrentUserId(userData._id || userData.id);

        const pendingFriends: string[] =
          userData.friends
            ?.filter(
              (friend: Friend) =>
                typeof friend === "object" && friend.friendStatus === "pending"
            )
            .map((friend: Friend) => {
              let id = "";
              if (friend.userId) id = friend.userId.toString();
              else if (typeof friend.user === "object" && friend.user._id)
                id = friend.user._id.toString();
              else if (typeof friend.user === "string") id = friend.user;

              return id;
            })
            .filter((id: string) => id !== "") || [];

        setAddedFriends((prev) => {
          const newAddedFriends: FriendStatus = { ...prev };
          pendingFriends.forEach((friendId: string) => {
            newAddedFriends[friendId] = true;
          });
          return newAddedFriends;
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Unable to load user profile. Please log in again.");
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      setError(null);

      const timeoutId = setTimeout(() => {
        fetchUsers(searchQuery);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchUsers = async (query: string) => {
    try {
      // Force refresh friend data before search
      await checkFriendStatus();

      const token = await authService.getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Keep the API call but also implement client-side filtering
      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users?search=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Received ${data.length} users from API`);
      
      // Convert search query to lowercase for case-insensitive comparison
      const lowerCaseQuery = query.toLowerCase();

      // Apply more thorough filtering:
      // 1. Filter out current user
      // 2. Filter out accepted friends
      // 3. Only include users whose username or email matches the search query
      const filteredResults = data.filter((user: UserModel) => {
        const userId = normalizeId(user._id || user.id);
        const username = (user.username || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        
        // Check all conditions for inclusion
        return (
          userId !== currentUserId && 
          !acceptedFriends[userId] &&
          (username.includes(lowerCaseQuery) || email.includes(lowerCaseQuery))
        );
      });

      console.log(`Filtered to ${filteredResults.length} matching users for query: "${query}"`);
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    if (!currentUserId) {
      setError("You need to be logged in to add friends.");
      return;
    }

    if (addedFriends[friendId]) {
      return;
    }

    setIsAddingFriend((prev) => ({ ...prev, [friendId]: true }));

    try {
        const token = await authService.getToken();
        if (!token) throw new Error("Not authenticated");

        const payload = {
          friendAction: {
            action: "add",
            friendId: friendId,
          },
        };

        const response = await fetch(
          `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/${currentUserId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            `Failed to add friend. Status: ${response.status}. Response: ${responseText}`
          );
        }

        // Find the user's information from searchResults
        if (response.ok) {
            const addedUser = searchResults.find(user => 
                normalizeId(user._id || user.id) === friendId
            );

            if (addedUser) {
                await NotificationService.schedulePushNotification({
                    title: 'Friend Request Sent',
                    body: `You sent a friend request to @${addedUser.username}`,
                    data: {
                        type: 'friend_request',
                        userId: friendId
                    },
                    showInApp: true // This will show the notification inside the app
                });
            }

            setAddedFriends((prev) => ({ ...prev, [friendId]: true }));
        }
    } catch (err) {
      console.error("Error adding friend:", err);
      alert(`Failed to add friend: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsAddingFriend((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUserId) {
      setError("You need to be logged in to manage friends.");
      return;
    }

    setIsRemovingFriend((prev) => ({ ...prev, [friendId]: true }));

    try {
      const token = await authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const payload = {
        friendAction: {
          action: "remove",
          friendId: friendId,
        },
      };

      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Failed to cancel friend request. Status: ${response.status}. Response: ${responseText}`
        );
      }

      // Remove from pending friends list
      setAddedFriends((prev) => {
        const updated = { ...prev };
        delete updated[friendId];
        return updated;
      });
    } catch (err) {
      console.error("Error canceling friend request:", err);
      alert(
        `Failed to cancel friend request: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsRemovingFriend((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  const checkFriendStatus = async () => {
    try {
      const token = await authService.getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Fetch user data directly from the API
      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        return;
      }

      const userData = await response.json();
      setCurrentUserId(userData._id);

      // Check if friends array exists
      if (!userData.friends || !Array.isArray(userData.friends)) {
        console.log("No friends array found in user data");
        return;
      }

      // Create maps to track pending and accepted friends
      const pendingFriendsMap: FriendStatus = {};
      const acceptedFriendsMap: FriendStatus = {};

      // Process each friend and update the appropriate map
      userData.friends.forEach((friend: Friend) => {
        let friendId = "";
        if (friend.userId) {
          friendId = typeof friend.userId === "object" && friend.userId._id 
            ? friend.userId._id 
            : String(friend.userId);
        } else if (friend.user) {
          if (typeof friend.user === "object" && friend.user._id) {
            friendId = friend.user._id;
          } else if (typeof friend.user === "string") {
            friendId = friend.user;
          }
        }

        if (friendId) {
          friendId = normalizeId(friendId);
          
          // Only check friendStatus field
          if (friend.friendStatus === "pending") {
            pendingFriendsMap[friendId] = true;
          } else if (friend.friendStatus === "accepted") {
            acceptedFriendsMap[friendId] = true;
          }
        }
      });

      // Update the states
      setAddedFriends(pendingFriendsMap);
      setAcceptedFriends(acceptedFriendsMap);
    } catch (error) {
      console.error("Error checking friend status:", error);
    }
  };

  useEffect(() => {
    checkFriendStatus();
  }, []);

  useEffect(() => {
  }, [addedFriends]);

  const renderUserItem = ({ item }: { item: UserModel }) => {
    // Ensure itemId is always a string, never undefined
    const itemId = normalizeId(item._id || item.id);
    
    // Only proceed if we have a valid ID
    if (!itemId) {
      console.warn(`Skipping user ${item.username} - no valid ID`);
      return null;
    }

    // Don't render already accepted friends
    if (acceptedFriends[itemId]) {
      return null;
    }

    // Check status using the string ID
    const isPending = !!addedFriends[itemId];
    const isAdding = !!isAddingFriend[itemId];
    const isRemoving = !!isRemovingFriend[itemId];
    
    return (
      <View style={styles.userItem}>
        <Image
          style={styles.avatar}
          source={item.avatarUrl ? { uri: item.avatarUrl } : undefined}
        />

        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username}</Text>
          <Text style={styles.name}>{item.email}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            (isAdding || isRemoving) && styles.addButtonDisabled,
            isPending && styles.pendingButton,
          ]}
          onPress={() => {
            if (isPending) {
              handleRemoveFriend(itemId);
            } else {
              handleAddFriend(itemId);
            }
          }}
          disabled={isAdding || isRemoving}
        >
          {isAdding || isRemoving ? (
            <ActivityIndicator size="small" color="white" />
          ) : isPending ? (
            <View style={styles.addedButtonContent}>
              <Ionicons name="time-outline" size={16} color="white" />
              <Text style={styles.addButtonText}>Pending</Text>
            </View>
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Add Friend",
          headerStyle: {
            backgroundColor: "#111827",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {!currentUserId && !error ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : searchQuery.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) =>
                item._id || item.id || String(Math.random())
              }
              renderItem={renderUserItem}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              }
            />
          ) : (
            <View style={styles.instructionContainer}>
              <Ionicons name="people" size={48} color="#4B5563" />
              <Text style={styles.instructionText}>
                Search for users by their username to send friend requests
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  backButton: {
    padding: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "white",
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 12,
  },
  resultsList: {
    paddingTop: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1F2937",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  addButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#6B21A8",
    opacity: 0.7,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  pendingButton: {
    backgroundColor: "#D97706", // Amber color for pending status
    opacity: 1,
  },
  addedButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    marginRight: 5,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  instructionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  instructionText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});
