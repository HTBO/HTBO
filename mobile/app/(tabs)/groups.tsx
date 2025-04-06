import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { Group } from "../../models/GroupModel";
import { authService } from "../../services/authService";

export default function SocialScreen() {
  console.log("Component rendering");
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [detailedFriends, setDetailedFriends] = useState<UserModel[]>([]);
  const [pendingFriendsDetails, setPendingFriendsDetails] = useState<
    Record<string, UserModel>
  >({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const friendsInitialized = useRef(false);
  const groupsInitialized = useRef(false);

  /**
   * Gets user details by user ID
   * @param userId The ID of the user to fetch details for
   * @returns Promise resolving to UserModel or null if error
   */
  const getUserById = async (userId: string): Promise<UserModel | null> => {
    try {
      const token = await authService.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch details for user ${userId}`);
        return null;
      }

      const userData = await response.json();
      return userData as UserModel;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  // Add useEffect to fetch pending friend details
  useEffect(() => {
    const fetchPendingFriendsDetails = async () => {
      const pendingFriends = friends.filter(
        (friend) => friend.friendStatus === "pending"
      );

      if (pendingFriends.length === 0) return;

      const pendingDetailsMap: Record<string, UserModel> = {};

      for (const friend of pendingFriends) {
        let userId = "";

        if (typeof friend.user === "object" && friend.user) {
          userId = friend.user._id || friend.user.id;
        } else if (typeof friend.user === "string") {
          userId = friend.user;
        } else if (friend.userId) {
          userId = friend.userId;
        }

        if (userId) {
          const userData = await getUserById(userId);
          if (userData) {
            pendingDetailsMap[userId] = userData;
          }
        }
      }

      setPendingFriendsDetails(pendingDetailsMap);
    };

    if (friends.length > 0) {
      fetchPendingFriendsDetails();
    }
  }, [friends]);

  const fetchFriends = async () => {
    console.log("fetchFriends function called");
    setIsLoadingFriends(true);
    setError(null);

    try {
      console.log("Getting auth token");
      const token = await authService.getToken();

      if (!token) {
        console.log("No token available");
        throw new Error("Authentication required");
      }

      console.log("Making API request to /users/myfriends");
      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/myfriends",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Friends API Response:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to load friends. Status: ${response.status}`);
      }

      const friendsData: Friend[] = await response.json();
      console.log("Friends data loaded:", friendsData);
      setFriends(friendsData);

      // Count and log friends with accepted status
      const acceptedFriends = friendsData.filter(
        (friend: Friend) => friend.friendStatus === "accepted"
      );
      console.log(
        `Found ${acceptedFriends.length} accepted friends:`,
        JSON.stringify(acceptedFriends, null, 2)
      );

      const acceptedFriendIds: string[] = acceptedFriends
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
            console.warn(
              `Failed to fetch details for user ${userId}, status: ${userResponse.status}`
            );
            return null;
          }

          const userData = await userResponse.json();
          return userData as UserModel;
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
      setIsLoadingFriends(false);
    }
  };

  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    setError(null);

    try {
      const token = await authService.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/mygroups",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load groups. Status: ${response.status}`);
      }

      const groupsData: Group[] = await response.json();
      setGroups(groupsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  useEffect(() => {
    console.log(
      "Friends initialization effect running, initialized:",
      friendsInitialized.current
    );
    if (!friendsInitialized.current) {
      console.log("Calling fetchFriends from useEffect");
      fetchFriends();
      friendsInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (!groupsInitialized.current) {
      fetchGroups();
      groupsInitialized.current = true;
    }
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
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase().trim();

    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        (group.description && group.description.toLowerCase().includes(query))
    );
  }, [searchQuery, groups]);

  useEffect(() => {
    // Add a console log after detailedFriends is updated
    console.log("detailedFriends updated:", detailedFriends);
  }, [detailedFriends]);

  useEffect(() => {
    // Add a console log after filteredDetailedFriends is updated
    console.log("filteredDetailedFriends updated:", filteredDetailedFriends);
  }, [filteredDetailedFriends]);

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
      setIsLoadingFriends(true);

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
      setIsLoadingFriends(false);
    }
  };

  const handleRetryFriends = () => {
    setFriends([]);
    setDetailedFriends([]);
    friendsInitialized.current = false;
    fetchFriends();
  };

  const handleRetryGroups = () => {
    setGroups([]);
    groupsInitialized.current = false;
    fetchGroups();
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleGroupPress(item.id)}
      activeOpacity={0.7}
    >
      <Image style={styles.avatar} />

      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemTime}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.itemFooter}>
          <Text
            style={styles.lastMessage}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.description || "No description"}
          </Text>

          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.members.length}</Text>
          </View>
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
            <View style={styles.acceptedBadge}>
              <Text style={styles.acceptedText}>Accepted</Text>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <Text
              style={styles.lastMessage}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.email}
            </Text>
            <Text style={styles.itemTime}>
              {item.updatedAt
                ? new Date(item.updatedAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFriendItem = ({ item }: { item: Friend | UserModel }) => {
    const isDetailedUser = "_id" in item;

    if (isDetailedUser) {
      return renderDetailedFriendItem({ item: item as UserModel });
    }

    const friendItem = item as Friend;
    const isPending = friendItem.friendStatus === "pending";
    const userId =
      typeof friendItem.user === "object"
        ? friendItem.user._id
        : friendItem.userId || friendItem.user;

    // Get username from friend item object
    const username =
      typeof friendItem.user === "object" && friendItem.user?.username
        ? friendItem.user.username
        : "Unknown User";

    return (
      <View style={styles.listItem}>
        <Image style={styles.avatar} />

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{username}</Text>
            {/* Remove the pending text here as it's redundant with the section header */}
          </View>
        </View>

        {isPending && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() =>
                console.log("Decline functionality to be implemented")
              }
              disabled={isLoadingFriends}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => userId && acceptFriendRequest(userId)}
              disabled={isLoadingFriends}
            >
              {isLoadingFriends ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const PendingFriendsSection = () => {
    const pendingFriends = friends.filter(
      (friend) => friend.friendStatus === "pending"
    );

    if (pendingFriends.length === 0) return null;

    return (
      <>
        <Text style={styles.sectionHeader}>Pending Friend Requests</Text>
        {pendingFriends.map((friend, index) => {
          // Extract user ID with better null checking
          let userId = "";

          if (
            typeof friend.user === "object" &&
            friend.user &&
            friend.user._id
          ) {
            userId = String(friend.user._id);
          } else if (typeof friend.user === "string") {
            userId = friend.user;
          } else if (friend.userId) {
            userId = String(friend.userId);
          }

          // Use a fallback key to ensure uniqueness
          const uniqueKey = userId || `pending-friend-${index}`;
          console.log("Using key for pending friend:", uniqueKey);

          // Get username from the fetched user details
          const userDetails = userId ? pendingFriendsDetails[userId] : null;
          const username = userDetails?.username || "Loading...";

          return (
            <View key={uniqueKey} style={styles.listItem}>
              <Image
                style={styles.avatar}
                source={
                  userDetails?.avatarUrl
                    ? { uri: userDetails.avatarUrl }
                    : undefined
                }
              />

              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{username}</Text>
                  {userDetails?.email && (
                    <Text style={styles.itemTime} numberOfLines={1}>
                      {userDetails.email}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() =>
                    console.log("Decline functionality to be implemented")
                  }
                  disabled={isLoadingFriends}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => userId && acceptFriendRequest(userId)}
                  disabled={isLoadingFriends}
                >
                  {isLoadingFriends ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </>
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
          {isLoadingFriends ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryFriends}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <PendingFriendsSection />
              {console.log(
                "Rendering friends section with:",
                filteredDetailedFriends.length,
                "friends"
              )}
              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
                Friends ({filteredDetailedFriends.length})
              </Text>
              <FlatList
                data={filteredDetailedFriends}
                keyExtractor={(item) => item._id}
                renderItem={renderDetailedFriendItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {searchQuery
                        ? "No friends found"
                        : "No accepted friends yet. Add some friends and accept requests to see them here!"}
                    </Text>
                    <TouchableOpacity
                      style={[styles.retryButton, { marginTop: 12 }]}
                      onPress={handleRetryFriends}
                    >
                      <Text style={styles.retryButtonText}>
                        Refresh Friends
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </>
          )}
        </>
      ) : (
        <>
          {isLoadingGroups ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryGroups}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item.id}
              renderItem={renderGroupItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "No groups found"
                      : "No groups yet. Create a group to get started!"}
                  </Text>
                </View>
              }
            />
          )}
        </>
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  declineButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
  },
  declineButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  pendingText: {
    color: "#F59E0B",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  acceptedBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  acceptedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
