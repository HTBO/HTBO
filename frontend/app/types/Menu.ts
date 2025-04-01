export interface MenuGroup {
    title: string;
    activeStyle?: boolean;
    items: MenuItem[];
}

export interface MenuItem {
    title: string;
    icon: string;
    link: string;
}