import type { User } from "./User"

export interface Group {
    _id: string
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