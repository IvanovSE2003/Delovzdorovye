import type { SidebarProps } from '../../../models/MenuItems';
import './Sidebar.scss';
import { NavLink, useLocation } from "react-router-dom";
import logo from '@/assets/images/logo.svg';
import { RouteNames } from '../../../routes';

const Sidebar: React.FC<SidebarProps> = ({ menuItems, className = '', countChange, countConsult, countOtherProblem }) => {

  const location = useLocation();
  const lastMenu = localStorage.getItem("lastMenu");

  const updatedMenuItems = menuItems.map(item => {
    if (item.path === RouteNames.SPECIALISTS) {
      return {
        ...item,
        notification: countChange > 0 ? `(${countChange})` : undefined
      };
    } else if (item.path === RouteNames.MAKECONSULTATION) {
      return {
        ...item,
        notification: `(${countConsult})(${countOtherProblem})` || undefined
      };
    }
    return item;
  });

  const isPathRelatedToMenu = (menuPath: string, currentPath: string) => {
    if (menuPath === RouteNames.MAKECONSULTATION) {
      return currentPath.startsWith(RouteNames.MAKECONSULTATION) || currentPath.startsWith(RouteNames.PROFILE);
    }
    return currentPath.startsWith(menuPath);
  };

  const activePath =
    menuItems.find(item => isPathRelatedToMenu(item.path, location.pathname))
      ?.path || lastMenu;

  return (
    <div className={`sidebar ${className}`}>
      <NavLink to={RouteNames.HOME}>
        <div className="sidebar__logo">
          <img src={logo} alt="logo" />
        </div>
      </NavLink>
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {updatedMenuItems?.map((item, index) => (
            <li key={index} className="sidebar__menu-item">
              <NavLink
                style={{ whiteSpace: 'pre-line' }}
                to={item.path}
                className={({ isActive }) =>
                  `${(isActive || activePath === item.path) ? 'active' : ''}`
                }
              >
                {item.name}
                <span>{item.notification !== undefined && ` ${item.notification}`}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;