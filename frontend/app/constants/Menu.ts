import type { MenuGroup } from "~/types/Menu";

export const menu: MenuGroup[] = [
    {
        title: "Menu",
        items: [
            {
                title: "Home",
                icon: "home",
                link: "/dashboard"
            },
            {
                title: "Sessions",
                icon: "session",
                link: "/dashboard/sessions"
            },
            {
                title: "Groups",
                icon: "group",
                link: "/dashboard/groups"
            },
            {
                title: "Friends",
                icon: "person",
                link: "/dashboard/friends"
            }
        ]
    },
    {
        title: "Quick Actions",
        items: [
            {
                title: "Create Session",
                icon: "add",
                link: "/dashboard/sessions/create"
            },
            {
                title: "Add Friend",
                icon: "add-friend",
                link: "/dashboard/friends/add"
            }
        ]
    }
];