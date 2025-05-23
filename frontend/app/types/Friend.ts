import type { User } from "./User";

export interface Friend {
    friendStatus: string;
    userId: string | User;
    initiator: boolean;
}
