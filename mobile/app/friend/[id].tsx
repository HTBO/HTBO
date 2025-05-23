import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { UserModel } from "../../models/UserModel";
import { authService } from "../../services/authService";
import { router } from "expo-router";

export default function FriendDetailScreen() {
  // Add Stack.Screen to hide the default header
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FriendDetailContent />
    </>
  );
}

function FriendDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [friend, setFriend] = useState<
    (UserModel & { friendStatus?: string }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFriendDetails();
  }, [id]);

  const fetchFriendDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await authService.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      // First get the friend relationship to get friendStatus
      const friendsResponse = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/myfriends",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let friendStatus = "";

      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        // Find this specific friend in the list
        const friendRelationship = friendsData.find((f: any) => {
          if (typeof f.user === "object" && f.user && f.user._id) {
            return f.user._id === id;
          }
          return f.userId === id || f.user === id;
        });

        if (friendRelationship) {
          friendStatus = friendRelationship.friendStatus || "";
        }
      }

      // Then get the user details
      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load friend details. Status: ${response.status}`
        );
      }

      const friendData = await response.json();
      setFriend({ ...friendData, friendStatus });
    } catch (err) {
      console.error("Failed to fetch friend details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load friend details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = () => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friend?.username} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            // Implement the API call to remove friend
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchFriendDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!friend) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Friend not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Friend Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileSection}>
          <Image
            style={styles.profileImage}
            source={friend.avatarUrl ? { uri: friend.avatarUrl } : undefined}
          />
          <Text style={styles.username}>{friend.username}</Text>
          <Text style={styles.email}>{friend.email}</Text>
          {friend.friendStatus && (
            <View
              style={[
                styles.statusBadge,
                friend.friendStatus === "accepted"
                  ? styles.acceptedStatus
                  : friend.friendStatus === "pending"
                  ? styles.pendingStatus
                  : styles.rejectedStatus,
              ]}
            >
              <Text style={styles.statusText}>{friend.friendStatus}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble" size={24} color="white" />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleRemoveFriend}
          >
            <Ionicons name="person-remove" size={24} color="white" />
            <Text style={styles.actionText}>Remove Friend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1F2937",
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  actionsSection: {
    paddingHorizontal: 16,
    gap: 16,
  },
  actionButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dangerButton: {
    backgroundColor: "#EF4444",
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  acceptedStatus: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  pendingStatus: {
    backgroundColor: "rgba(252, 211, 77, 0.2)",
  },
  rejectedStatus: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textTransform: "capitalize",
  },
});
