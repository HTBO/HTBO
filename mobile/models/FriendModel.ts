// Updated Friend interface to match API response format
export interface Friend {
  // Either userId as string (old format) or as UserDetails object (new format)
  userId?: string | UserDetails;
  // Keep user field for backward compatibility
  user?: string | { _id: string; username?: string; [key: string]: any };
  // Both status and friendStatus can exist in responses
  status?: "pending" | "accepted" | "rejected";
  friendStatus?: string;
  // Other potential fields
  _id?: string;
}

// Define the structure of user details returned in the userId field
export interface UserDetails {
  _id: string;
  id?: string;
  username: string;
  avatarUrl?: string;
  profileUrl?: string;
  email?: string;
  [key: string]: any;
}

export interface FriendStatus {
  [key: string]: boolean;
}
