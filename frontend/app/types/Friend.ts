import type { User } from "./User";

export interface Friend {
    status: string;
    userId: string | User;
}
