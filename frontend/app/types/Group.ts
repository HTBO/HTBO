import type { User } from "./User"

export interface Group {
    id: string
    name: string
    description: string
    ownerId: string
    members: Array<GroupMember>
    createdAt: Date
}

export interface GroupMember {
    memberId: string | User
    groupStatus: 'pending' | 'accepted' | 'rejected' | 'owner'
}