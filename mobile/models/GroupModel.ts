import { UserModel } from "./UserModel";

export interface GroupMemberReference {
  memberId: string;
  groupStatus: "pending" | "accepted" | "rejected";
}

export interface Group {
  ownerId: string; // ID of the group owner
  name: string; // Name of the group
  description: string; // Description of the group
  members: GroupMemberReference[]; // Array of member references (lightweight)
  expandedMembers?: UserModel[]; // Optional expanded member objects after fetching
  createdAt: string; // Creation timestamp
  updatedAt: string; // Last update timestamp
  id: string; // Unique identifier for the group
}
