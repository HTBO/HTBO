// Add these type definitions at the top of your file
export interface Friend {
    userId?: string;
    user?: string | { _id: string; [key: string]: any };
    status?: string;
  }
  
export interface FriendStatus {
    [key: string]: boolean;
  }