// Add these type definitions at the top of your file
export interface Friend {
  userId?: string;
  user?: string | { _id: string; username?: string; [key: string]: any };
  friendStatus?: "pending" | "accepted" | "rejected";
}

export interface FriendStatus {
  [key: string]: boolean;
}
