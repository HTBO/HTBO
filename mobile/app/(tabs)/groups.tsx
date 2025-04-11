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
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

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
  const [processingFriends, setProcessingFriends] = useState<{[key: string]: boolean}>({});
  const [processingGroups, setProcessingGroups] = useState<{[key: string]: boolean}>({});

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

      console.log(
        "Pending friends data:",
        JSON.stringify(pendingFriends, null, 2)
      );
      const pendingDetailsMap: Record<string, UserModel> = {};

      for (const friend of pendingFriends) {
        // Extract user ID based on updated Friend model
        let userId = "";
        let userDetails: UserModel | null = null;

        // Check if userId is a UserDetails object (new API response format)
        if (
          typeof friend.userId === "object" &&
          friend.userId !== null &&
          friend.userId._id
        ) {
          userId = friend.userId._id;

          // We can use the embedded UserDetails directly without an API call
          userDetails = {
            _id: friend.userId._id,
            username: friend.userId.username,
            email: friend.userId.email || "",
            avatarUrl: friend.userId.avatarUrl,
            // Add other required fields from UserModel
            id: friend.userId.id || friend.userId._id,
          };

          pendingDetailsMap[userId] = userDetails;
          continue; // Skip the API call since we already have the details
        }
        // Fall back to previous extraction methods for backwards compatibility
        else if (typeof friend.user === "object" && friend.user) {
          if (friend.user._id) {
            userId = String(friend.user._id);
          } else if (friend.user.id) {
            userId = String(friend.user.id);
          }
        } else if (typeof friend.user === "string") {
          userId = friend.user;
        } else if (typeof friend.userId === "string") {
          userId = friend.userId;
        }

        if (!userId) {
          console.warn("Could not extract user ID from friend:", friend);
          continue;
        }

        // Only fetch if we need to (if userId wasn't a UserDetails object)
        console.log(`Fetching details for user ID: ${userId}`);
        const userData = await getUserById(userId);
        if (userData) {
          pendingDetailsMap[userId] = userData;
        } else {
          console.warn(`Failed to get user details for ID: ${userId}`);
        }
      }

      setPendingFriendsDetails(pendingDetailsMap);
    };

    if (friends.length > 0) {
      fetchPendingFriendsDetails();
    }
  }, [friends]);

  const fetchFriends = async () => {
    setIsLoadingFriends(true);
    setError(null);

    try {
      const token = await authService.getToken();
      if (!token) throw new Error("Authentication required");

      // This is the GET request to fetch friends
      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/myfriends",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load friends. Status: ${response.status}`);
      }

      const friendsData: Friend[] = await response.json();
      console.log(
        "Raw friends data received:",
        JSON.stringify(friendsData, null, 2)
      );

      // Filter only accepted friends
      const acceptedFriends = friendsData.filter(
        (friend) => friend.friendStatus === "accepted"
      );

      console.log(`Found ${acceptedFriends.length} accepted friends`);

      // Improved mapping to handle all possible formats
      const acceptedFriendsDetails = acceptedFriends
        .map((friend) => {
          // Case 1: userId is an object with user details
          if (typeof friend.userId === "object" && friend.userId !== null) {
            return {
              _id: friend.userId._id,
              username: friend.userId.username || "Unknown",
              email: friend.userId.email || "",
              avatarUrl: friend.userId.avatarUrl,
              friends: [],
              games: [],
              sessions: [],
              groups: [],
              createdAt: "",
              updatedAt: "",
              friendStatus: "accepted",
            } as UserModel;
          }
          // Case 2: user is an object with user details
          else if (typeof friend.user === "object" && friend.user !== null) {
            return {
              _id: friend.user._id || friend.user.id || "",
              username: friend.user.username || "Unknown",
              email: friend.user.email || "",
              avatarUrl: friend.user.avatarUrl,
              friends: [],
              games: [],
              sessions: [],
              groups: [],
              createdAt: "",
              updatedAt: "",
              friendStatus: "accepted",
            } as UserModel;
          }
          // Case 3: userId is a string - we'd need to fetch details separately
          else if (
            typeof friend.userId === "string" ||
            typeof friend.user === "string"
          ) {
            const id =
              typeof friend.userId === "string" ? friend.userId : friend.user;
            console.log(
              `Friend with string ID found: ${id}, will need details`
            );
            // Return minimal info for now
            return {
              _id: id as string,
              username: "User " + id,
              email: "",
              friends: [],
              games: [],
              sessions: [],
              groups: [],
              createdAt: "",
              updatedAt: "",
              friendStatus: "accepted",
            } as UserModel;
          }

          return null;
        })
        .filter((friend): friend is UserModel => friend !== null);

      console.log(
        `Processed ${acceptedFriendsDetails.length} accepted friends into detailed format`
      );

      setDetailedFriends(acceptedFriendsDetails);
      setFriends(friendsData);
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

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, refreshing data...');
      // Reset initialization flags to force refresh
      friendsInitialized.current = false;
      groupsInitialized.current = false;
      
      // Fetch fresh data
      fetchFriends();
      fetchGroups();

      return () => {
        // Cleanup if needed
        console.log('Screen unfocused');
      };
    }, []) // Empty dependency array since we want to run this every time the screen focuses
  );

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
      console.log("Accepting friend request with ID:", friendId);

      if (!friendId || typeof friendId !== "string") {
        throw new Error("Invalid friend ID provided");
      }

      // Get current user's token and ID
      const token = await authService.getToken();
      const userData = await authService.getUserData();
      const currentUserId = userData._id || userData.id;

      if (!token || !currentUserId) {
        throw new Error("Authentication required");
      }

      // Format the friend ID - ensure it's a clean string without any wrapper objects
      // This handles cases where the ID might be nested in an object or have extra quotes
      const cleanFriendId = friendId.trim();

      console.log("Using cleaned friend ID for request:", cleanFriendId);

      // Prepare the request payload with friendStatus instead of status
      const payload = {
        friendAction: {
          action: "update-status",
          friendId: cleanFriendId,
          friendStatus: "accepted",
        },
      };

      console.log("Sending payload:", JSON.stringify(payload));

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

  // Add this function to implement the decline functionality
  const declineFriendRequest = async (friendId: string): Promise<boolean> => {
    if (!friendId || typeof friendId !== "string") {
      console.error("Invalid friend ID:", friendId);
      return false;
    }
  
    const cleanId = friendId.trim();
    console.log(`Starting decline process for friend ID: ${cleanId}`);
    
    // Check if we're already processing this friend
    if (processingFriends[cleanId]) {
      console.log(`Already processing friend ${cleanId}, skipping duplicate request`);
      return false;
    }
    
    // Mark this specific friend as being processed
    setProcessingFriends(prev => ({ ...prev, [cleanId]: true }));
    
    try {
      console.log(`Declining friend request with ID: ${cleanId}`);
      
      // Get current user's token and ID
      const token = await authService.getToken();
      const userData = await authService.getUserData();
      const currentUserId = userData._id || userData.id;
  
      if (!token || !currentUserId) {
        throw new Error("Authentication required");
      }
  
      // Create the payload
      const payload = {
        friendAction: {
          action: "remove",
          friendId: cleanId,
        }
      };
  
      console.log(`Sending decline payload for ${cleanId}:`, JSON.stringify(payload));
  
      // Make the API call using PATCH
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
          `Failed to decline friend request for ${cleanId}. Status: ${response.status}. ${errorText}`
        );
      }
  
      console.log(`Successfully declined friend request for ${cleanId}`);
      
      // Refresh the friends list
      await fetchFriends();
      return true;
    } catch (error) {
      console.error(`Error declining friend request for ${cleanId}:`, error);
      setError(
        error instanceof Error
          ? error.message
          : `Failed to decline friend request for ${cleanId}`
      );
      return false;
    } finally {
      // Clear the processing state for this specific friend
      console.log(`Clearing processing state for ${cleanId}`);
      setProcessingFriends(prev => ({ ...prev, [cleanId]: false }));
    }
  };

  const acceptGroupInvite = async (groupId: string): Promise<boolean> => {
    if (processingGroups[groupId]) return false;
    
    setProcessingGroups(prev => ({ ...prev, [groupId]: true }));
    
    try {
      const token = await authService.getToken();
      const userData = await authService.getUserData();
      
      if (!token || !userData) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/groups/confirm`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData._id,
            groupId: groupId
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept group invite");
      }

      await fetchGroups();
      return true;
    } catch (error) {
      console.error("Error accepting group invite:", error);
      return false;
    } finally {
      setProcessingGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const declineGroupInvite = async (groupId: string): Promise<boolean> => {
    if (processingGroups[groupId]) return false;
    
    setProcessingGroups(prev => ({ ...prev, [groupId]: true }));
    
    try {
      const token = await authService.getToken();
      const userData = await authService.getUserData();
      
      if (!token || !userData) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/groups/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData._id,
            groupId: groupId
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to decline group invite");
      }

      await fetchGroups();
      return true;
    } catch (error) {
      console.error("Error declining group invite:", error);
      return false;
    } finally {
      setProcessingGroups(prev => ({ ...prev, [groupId]: false }));
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

    // Extract user info with updated model support
    let userId: string | undefined;
    let username = "Unknown User";
    let avatarUrl: string | undefined;

    // Use UserDetails from userId if available (new model)
    if (typeof friendItem.userId === "object" && friendItem.userId !== null) {
      userId = friendItem.userId._id;
      username = friendItem.userId.username;
      avatarUrl = friendItem.userId.avatarUrl;
    }
    // Fall back to user object for backward compatibility
    else if (typeof friendItem.user === "object" && friendItem.user) {
      userId = friendItem.user._id;
      username = friendItem.user.username || "Unknown User";
      avatarUrl = friendItem.user.avatarUrl;
    }
    // Use string ID from either field
    else {
      userId =
        typeof friendItem.userId === "string"
          ? friendItem.userId
          : typeof friendItem.user === "string"
          ? friendItem.user
          : undefined;
    }

    return (
      <View style={styles.listItem}>
        <Image
          style={styles.avatar}
          source={avatarUrl ? { uri: avatarUrl } : undefined}
        />

        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{username}</Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => userId && declineFriendRequest(userId)}
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

  // Update the PendingFriendsSection
  const PendingFriendsSection = () => {
    const pendingFriends = friends.filter(
      (friend) => friend.friendStatus === "pending"
    );

    if (pendingFriends.length === 0) return null;

    return (
      <>
        <Text style={styles.sectionHeader}>Pending Friend Requests</Text>
        {pendingFriends.map((friend, index) => {
          // Extract a consistent, reliable ID for this friend
          let userId = "";
          let username = "Loading...";
          let email = "";
          let avatarUrl: string | undefined = undefined;

          // First check if userId is a UserDetails object (new format)
          if (typeof friend.userId === "object" && friend.userId !== null) {
            userId = friend.userId._id;
            username = friend.userId.username;
            email = friend.userId.email || "";
            avatarUrl = friend.userId.avatarUrl;
          }
          // Fall back to previous extraction methods
          else if (typeof friend.user === "object" && friend.user) {
            userId = friend.user._id || friend.user.id || "";
            username = friend.user.username || "Unknown";
            email = friend.user.email || "";
            avatarUrl = friend.user.avatarUrl;
          } else if (typeof friend.user === "string") {
            userId = friend.user;
          } else if (typeof friend.userId === "string") {
            userId = friend.userId;
          }

          // Skip rendering if no valid userId is found
          if (!userId) {
            console.warn(`No valid userId found for pending friend at index ${index}`);
            return null;
          }

          // Store this friend's ID in a data attribute to ensure the correct ID is used
          const uniqueKey = `pending-friend-${userId}-${index}`;
          const isProcessing = processingFriends[userId] || false;

          return (
            <View key={uniqueKey} style={styles.listItem}>
              <Image
                style={styles.avatar}
                source={avatarUrl ? { uri: avatarUrl } : undefined}
              />

              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{username}</Text>
                  {email && (
                    <Text style={styles.itemTime} numberOfLines={1}>
                      {email}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => {
                    console.log(`Declining friend with ID: ${userId}`); 
                    declineFriendRequest(userId);
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.declineButtonText}>Decline</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => {
                    console.log(`Accepting friend with ID: ${userId}`);
                    acceptFriendRequest(userId);
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }).filter(Boolean)}
      </>
    );
  };

  const PendingGroupsSection = () => {
    const [currentUserId, setCurrentUserId] = useState<string>("");

    useEffect(() => {
      const getUserId = async () => {
        const userData = await authService.getUserData();
        if (userData) {
          setCurrentUserId(userData._id || userData.id); // Handle both _id and id
        }
      };
      getUserId();
    }, []);

    // Debug logs
    console.log('Current user ID:', currentUserId);
    console.log('All groups:', groups);

    const pendingGroups = groups.filter(group => {
      const memberStatus = group.members.find(member => 
        member.memberId === currentUserId
      );
      console.log(`Group ${group.id} member status:`, memberStatus);
      return memberStatus?.groupStatus === "pending";
    });

    console.log('Pending groups:', pendingGroups);

    if (!currentUserId || pendingGroups.length === 0) return null;

    return (
      <>
        <Text style={styles.sectionHeader}>Pending Group Invites</Text>
        {pendingGroups.map((group) => (
          <View key={`pending-group-${group.id}`} style={styles.listItem}>
            <Image style={styles.avatar} />
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{group.name}</Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {group.description || "No description"}
              </Text>
            </View>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => declineGroupInvite(group.id)}
                disabled={processingGroups[group.id]}
              >
                {processingGroups[group.id] ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.declineButtonText}>Decline</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => acceptGroupInvite(group.id)}
                disabled={processingGroups[group.id]}
              >
                {processingGroups[group.id] ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.acceptButtonText}>Accept</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
            <>
              <PendingGroupsSection />
              <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
                My Groups ({filteredGroups.length})
              </Text>
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
            </>
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
    alignItems: "center", // Ensure vertical centering
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
    justifyContent: "center", // Add this to center content vertically
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
    justifyContent: "center", // Add this to center buttons
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
