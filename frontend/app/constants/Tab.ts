import { SectionsFriends, SectionsSessions } from "#components";
import type { Tab } from "~/types/Tab";

export const profileTabs: Tab[] = [
    {
        name: 'Friends',
        component: markRaw(SectionsFriends)
    },
    {
        name: 'Sessions',
        component: markRaw(SectionsSessions)
    }
];