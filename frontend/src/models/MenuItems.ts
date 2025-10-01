import type { Role } from "./Auth";

export interface MenuItem {
    path: string;
    name: string;
    notification?: number;
}

export interface SidebarProps {
    menuItems: MenuItem[];
    className?: string;
    role: Role;
}