import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/services/authService";
import {
  SessionModel,
  SessionList,
  formatSession,
} from "@/models/SessionModel";

export default function SessionsScreen() {
  // Update type to use SessionList
  const [sessions, setSessions] = useState<SessionList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Change from accepting just sessionId to accepting the full session object
  const handleCardPress = (session: SessionModel) => {
    router.push({
      pathname: "/session/[id]",
      params: { id: session._id },
    });
  };

  useEffect(() => {
    getUserSessionInfo();
  }, []);

  async function getUserSessionInfo() {
    try {
      setIsLoading(true);

      const tokenObj = await authService.getToken();
      // console.log("Token object:", tokenObj);
      if (!tokenObj) {
        console.error("No auth data found");
        setError("Authentication required");
        return;
      }
      
      const token = tokenObj;
      console.log(tokenObj);
      if (!token) {
        console.error("No token found in auth data");
        setError("Authentication error");
        return;
      }

      const response = await fetch(
        "https://htbo-backend-ese0ftgke9hza0dj.germanywestcentral-01.azurewebsites.net/api/users/mysessions",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        setError(`Server error: ${response.status}`);
        return;
      }

      const sessionsData = await response.json();
      // console.log("Sessions data:", sessionsData);

      // Format the API response using our helper function
      const formattedSessions = sessionsData.map((session: any) =>
        formatSession(session)
      );
      setSessions(formattedSessions);
    } catch (error) {
      console.error("Error in getUserSessionInfo:", error);
      setError("Failed to load sessions data");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sessions</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getUserSessionInfo}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#4B5563" />
          <Text style={styles.emptyText}>No sessions found</Text>
          <Text style={styles.emptySubtext}>
            Your game sessions will appear here
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/create-session")}
          >
            <Text style={styles.createButtonText}>Create a Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              gameImage={
                session.gameImage || require("@/assets/images/games/fifa.png")
              }
              gameTitle={session.gameName || "Game Session"}
              title={session.description || "Untitled Session"}
              date={formatDate(session.scheduledAt) || "No date set"}
              participants={session.participants?.length || 0}
              onPress={() => handleCardPress(session)} // Pass the entire session object
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Update SessionCardProps to use proper types
interface SessionCardProps {
  gameImage: any; // Keep as any for now since it could be various types
  gameTitle: string;
  title: string;
  date: string;
  participants: number;
  onPress: () => void;
}

// Modified Session Card Component with image
const SessionCard = ({
  gameImage,
  gameTitle,
  title,
  date,
  participants,
  onPress,
}: SessionCardProps) => {
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
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
          style={styles.arrowIcon}
        />
      </View>
    </TouchableOpacity>
  );
};

// Format date for better display
function formatDate(dateString: string | undefined) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return (
      date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }) +
      `, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#111827",
  },
  scrollView: {
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#7C3AED",
    fontWeight: "600",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  cardInfo: {
    gap: 6,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  arrowIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#9CA3AF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#EF4444",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4B5563",
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: "#9CA3AF",
  },
  createButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
  },
});
