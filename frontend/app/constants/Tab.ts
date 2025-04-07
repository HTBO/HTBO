import FriendsSection from "~/components/FriendsSection.vue";
import type { Tab } from "~/types/Tab";

export const profileTabs: Tab[] = [
    {
        name: 'Friends',
        component: markRaw(FriendsSection)
    }
];