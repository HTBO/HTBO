import type { MenuGroup } from "~/types/Menu";

export const Menu: MenuGroup[] = [
    {
        title: "Menu",
        items: [
            {
                title: "Home",
                icon: "home",
                link: "/"
            },
            {
                title: "Sessions",
                icon: "session",
                link: "/sessions"
            },
            {
                title: "groups",
                icon: "group",
                link: "/groups"
            },
            {
                title: "Friends",
                icon: "friend",
                link: "/friends"
            }
        ]
    },
    {
        title: "Quick Actions",
        items: [
            {
                title: "Create Session",
                icon: "add",
                link: "/sessions/create"
            },
            {
                title: "Add Friend",
                icon: "addFriend",
                link: "/friends/add"
            }
        ]
    }
];