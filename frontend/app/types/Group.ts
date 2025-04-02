import type { User } from "./User"

export interface Group {
    _id: string
    name: string
    description: string
    members: {
        memberId: string | User
        status: 'pending' | 'accepted' | 'rejected' | 'owner'
    }
    createdAt: Date
}