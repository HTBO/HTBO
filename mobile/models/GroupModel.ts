export interface GroupMember {
    status: string;      // Member status (e.g., "pending", "accepted")
    memberId: string;    // ID of the member
    groupStatus: string; // Status related to the group (e.g., "pending", "active")
  }
  
  export interface Group {
    ownerId: string;     // ID of the group owner
    name: string;        // Name of the group
    description: string; // Description of the group
    members: GroupMember[]; // Array of group members
    createdAt: string;   // Creation timestamp
    updatedAt: string;   // Last update timestamp
    id: string;          // Unique identifier for the group
  }