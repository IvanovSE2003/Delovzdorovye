export interface MenuItem {
    path: string;
    name: string;
}

export interface SidebarProps {
    menuItems: { path: string; name: string }[];
    className?: string;
}