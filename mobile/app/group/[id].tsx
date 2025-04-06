import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Group, GroupMemberReference } from "../../models/GroupModel";
import { UserModel } from "../../models/UserModel";
import { authService } from "../../services/authService";
import { router } from "expo-router";

export default function GroupDetailScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GroupDetailContent />
    </>
  );
}

function GroupDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await authService.getToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      // Fetch group details
      const response = await fetch(
        `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/groups/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load group details. Status: ${response.status}`
        );
      }

      const groupData = await response.json();
      setGroup(groupData);

      // Fetch group members
      if (groupData.members && groupData.members.length > 0) {
        const memberPromises = groupData.members.map(
          async (member: GroupMemberReference) => {
            const memberResponse = await fetch(
              `https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/${member.memberId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!memberResponse.ok) return null;
            const userData = await memberResponse.json();
            // Add the groupStatus from the member object to the user data
            return { ...userData, groupStatus: member.groupStatus };
          }
        );

        const memberResults = await Promise.all(memberPromises);
        setMembers(
          memberResults.filter((member): member is UserModel => member !== null)
        );
      }
    } catch (err) {
      console.error("Failed to fetch group details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load group details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave ${group?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            // Implement the API call to leave group
            router.back();
          },
        },
      ]
    );
  };

  const renderMemberItem = ({
    item,
  }: {
    item: UserModel & { groupStatus?: string };
  }) => (
    <View style={styles.memberItem}>
      <Image
        style={styles.memberAvatar}
        source={item.avatarUrl ? { uri: item.avatarUrl } : undefined}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.username}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        {item.groupStatus && (
          <View
            style={[
              styles.statusBadge,
              item.groupStatus === "accepted"
                ? styles.acceptedStatus
                : item.groupStatus === "pending"
                ? styles.pendingStatus
                : styles.rejectedStatus,
            ]}
          >
            <Text style={styles.statusText}>{item.groupStatus}</Text>
          </View>
        )}
      </View>
    </View>
  );

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
            onPress={fetchGroupDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group not found</Text>
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Group Details</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.groupInfoSection}>
          <Image style={styles.groupImage} />
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>
            {group.description || "No description available"}
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(group.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Members</Text>
          <FlatList
            data={members}
            renderItem={renderMemberItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No members found</Text>
            }
          />
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleLeaveGroup}
        >
          <Ionicons name="exit-outline" size={24} color="white" />
          <Text style={styles.actionText}>Leave Group</Text>
        </TouchableOpacity>
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
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  groupInfoSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1F2937",
    marginBottom: 16,
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  groupDescription: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#1F2937",
    marginHorizontal: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  membersSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1F2937",
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  memberEmail: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 24,
  },
  actionButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
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
    fontWeight: "500",
    textTransform: "capitalize",
  },
});
