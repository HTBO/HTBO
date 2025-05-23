export interface SessionInfo {
  sessionId: string;
  status: "pending" | "active" | "completed" | "cancelled";
}

export type ImageSource = string | { uri: string } | number | null;

// Add these status properties for when a user is in different contexts
export interface UserModel {
  _id: string;
  id?: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  friends: string[] | any[];
  games: string[] | any[];
  sessions: SessionInfo[];
  groups: string[] | any[];
  createdAt: string;
  updatedAt: string;
  profileUrl?: string;

  // Status properties when a user appears in different contexts
  friendStatus?: "pending" | "accepted" | "rejected"; // For friends list
  groupStatus?: "pending" | "accepted" | "rejected"; // For group members
  sessionStatus?: "pending" | "accepted" | "rejected"; // For session participants
  memberId?: string; // Used when referencing a user as a group member
}

// Default values for creating a new user or initializing state
export const defaultUser: UserModel = {
  _id: "",
  username: "",
  email: "",
  avatarUrl: null,
  friends: [],
  games: [],
  sessions: [],
  groups: [],
  createdAt: "",
  updatedAt: "",
  profileUrl: "",
};
