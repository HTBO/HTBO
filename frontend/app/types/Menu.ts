export interface MenuGroup {
    title: string;
    items: MenuItem[];
}

export interface MenuItem {
    title: string;
    icon: string;
    link: string;
}