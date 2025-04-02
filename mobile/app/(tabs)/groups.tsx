import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Friend, FriendStatus } from "../../models/FriendModel";
import { UserModel } from "../../models/UserModel";
import { authService } from "../../services/authService";

const GROUPS = [
  {
    id: "1",
    name: "FIFA Weekend Squad",
    lastMessage: "Is everyone ready for tonight's match?",
    time: "12:42 PM",
    unread: 3,
    avatar: "",
  },
  {
    id: "2",
    name: "Rocket League Team",
    lastMessage: "I'll be online in 10 minutes",
    time: "11:20 AM",
    unread: 0,
    avatar: "",
  },
  {
    id: "3",
    name: "Fortnite Pros",
    lastMessage: "Let's drop at Tilted Towers",
    time: "Yesterday",
    unread: 0,
    avatar: "",
  },
  {
    id: "4",
    name: "College Gaming Club",
    lastMessage: "Tournament is scheduled for Saturday",
    time: "Yesterday",
    unread: 5,
    avatar: "",
  },
  {
    id: "5",
    name: "Among Us Crew",
    lastMessage: "I saw Red vent!",
    time: "Monday",
    unread: 0,
    avatar: "",
  },
];

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [detailedFriends, setDetailedFriends] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await authService.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/myfriends",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load friends. Status: ${response.status}`);
      }

      const friendsData: Friend[] = await response.json();
      setFriends(friendsData);

      const acceptedFriendIds: string[] = friendsData
        .filter((friend: Friend) => friend.status === "accepted")
        .map((friend: Friend) => {
          if (
            typeof friend.user === "object" &&
            friend.user &&
            "_id" in friend.user
          ) {
            return friend.user._id.toString();
          } else if (friend.userId) {
            return friend.userId.toString();
          } else if (typeof friend.user === "string") {
            return friend.user;
          }
          return "";
        })
        .filter((id) => id !== "");

      const userDetailsPromises = acceptedFriendIds.map(
        async (userId: string) => {
          const userResponse = await fetch(
            `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/${userId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!userResponse.ok) {
            console.warn(`Failed to fetch details for user ${userId}`);
            return null;
          }

          return (await userResponse.json()) as UserModel;
        }
      );

      const userDetails = await Promise.all(userDetailsPromises);
      const validUserDetails = userDetails.filter(
        (user): user is UserModel => user !== null
      );

      setDetailedFriends(validUserDetails);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setError(err instanceof Error ? err.message : "Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const filteredDetailedFriends = useMemo(() => {
    if (!searchQuery.trim()) return detailedFriends;
    const query = searchQuery.toLowerCase().trim();

    return detailedFriends.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [searchQuery, detailedFriends]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return GROUPS;
    const query = searchQuery.toLowerCase().trim();
    return GROUPS.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleGroupPress = (groupId: string) => {
    router.push({
      pathname: "/group/[id]",
      params: { id: groupId },
    });
  };

  const handleFriendPress = (friendId: string) => {
    router.push({
      pathname: "/friend/[id]",
      params: { id: friendId },
    });
  };

  /**
   * Accepts a friend request from another user
   * @param friendId The ID of the user who sent the friend request
   * @returns Promise resolving to success or error
   */
  const acceptFriendRequest = async (friendId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Get current user's token and ID
      const token = await authService.getToken();
      const userData = await authService.getUserData();
      const currentUserId = userData._id || userData.id;

      if (!token || !currentUserId) {
        throw new Error("Authentication required");
      }

      // Prepare the request payload
      const payload = {
        friendAction: {
          action: "update-status",
          friendId: friendId,
          status: "accepted",
        },
      };

      // Make the API call
      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to accept friend request. Status: ${response.status}. ${errorText}`
        );
      }

      // Refresh the friends list
      await fetchFriends();
      return true;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to accept friend request"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const renderGroupItem = ({ item }: { item: (typeof GROUPS)[number] }) => (
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

  const renderDetailedFriendItem = ({ item }: { item: UserModel }) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handleFriendPress(item._id)}
        activeOpacity={0.7}
      >
        <Image
          style={styles.avatar}
          source={item.avatarUrl ? { uri: item.avatarUrl } : undefined}
        />

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.username}</Text>
            <Text style={styles.itemTime}>
              {item.updatedAt
                ? new Date(item.updatedAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </View>

          <View style={styles.itemFooter}>
            <Text
              style={styles.lastMessage}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.email}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFriendItem = ({ item }: { item: Friend | UserModel }) => {
    // Determine if this is a detailed user or a basic friend object
    const isDetailedUser = "_id" in item;

    // For detailed users (already accepted friends), use the existing rendering
    if (isDetailedUser) {
      return renderDetailedFriendItem({ item: item as UserModel });
    }

    // For pending friend requests
    const friendItem = item as Friend;
    const isPending = friendItem.status === "pending";
    const userId =
      typeof friendItem.user === "object"
        ? friendItem.user._id
        : friendItem.userId || friendItem.user;

    return (
      <View style={styles.listItem}>
        <Image style={styles.avatar} />

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>
              {typeof friendItem.user === "object"
                ? friendItem.user.username || "Unknown User"
                : "Friend Request"}
            </Text>
            <Text style={[styles.itemTime, isPending && styles.pendingText]}>
              {isPending ? "Pending" : friendItem.status}
            </Text>
          </View>
        </View>

        {isPending && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => userId && acceptFriendRequest(userId)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.acceptButtonText}>Accept</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push(
              activeTab === "friends" ? "/add-friend" : "/create-group"
            )
          }
        >
          <Ionicons name="add-circle" size={32} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${
            activeTab === "friends" ? "friends" : "groups"
          }...`}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
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

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "friends" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("friends")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "groups" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("groups")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "groups" && styles.activeTabText,
            ]}
          >
            Groups
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "friends" ? (
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setFriends([]);
                  setDetailedFriends([]);
                  fetchFriends();
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item) =>
                "_id" in item ? item._id : item.userId || item.user
              }
              renderItem={renderFriendItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "No friends found"
                      : "No friends yet. Add some friends to get started!"}
                  </Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
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
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#1F2937",
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#374151",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  activeTabText: {
    color: "white",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1F2937",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  itemTime: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#9CA3AF",
    flex: 1,
    marginRight: 8,
  },
  onlineStatus: {
    color: "#34D399",
  },
  unreadBadge: {
    backgroundColor: "#7C3AED",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
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
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#374151",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  pendingText: {
    color: "#F59E0B", // amber color for pending
  },
});
