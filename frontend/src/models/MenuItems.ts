export interface MenuItem {
    path: string;
    name: string;
}

export interface SidebarProps {
    menuItems: MenuItem[];
    logo?: React.ReactNode;
    className?: string;
}