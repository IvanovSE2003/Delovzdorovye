import type { SidebarProps } from '../../../models/MenuItems';
import './Sidebar.scss';
import { NavLink, useLocation } from "react-router-dom";
import logo from '@/assets/images/logo.svg';
import { useEffect, useState } from 'react';
import { RouteNames } from '../../../routes';
import AdminService from '../../../services/AdminService';
import { processError } from '../../../helpers/processError';

const Sidebar: React.FC<SidebarProps> = ({ menuItems, className = '', role }) => {

  let countMessage = 0;
  const location = useLocation();
  const lastMenu = localStorage.getItem("lastMenu");
  const [countChange, setCountChange] = useState(countMessage);
  
  const updatedMenuItems = menuItems.map(item =>
    item.path === RouteNames.SPECIALISTS
      ? { ...item, notification: countChange }
      : item
  );

  const isPathRelatedToMenu = (menuPath: string, currentPath: string) => {
    if (menuPath === '/make-consultation') {
      return currentPath.startsWith('/make-consultation') || currentPath.startsWith('/profile/');
    }
    return currentPath.startsWith(menuPath);
  };

  const activePath =
    menuItems.find(item => isPathRelatedToMenu(item.path, location.pathname))
      ?.path || lastMenu;

  useEffect(() => {
    if (role === "ADMIN") {
      let isMounted = true;
      let timeoutId: string | number | NodeJS.Timeout | undefined;

      const fetchWithDelay = async () => {
        if (!isMounted) return;

        try {
          const count = await AdminService.getChangesCount();
          if (isMounted) {
            setCountChange(count.data);
          }
        } catch (e) {
          if (isMounted) {
            processError(e, "Ошибка при получении количества изменений");
          }
        } finally {
          if (isMounted) {
            timeoutId = setTimeout(fetchWithDelay, 5000);
          }
        }
      };

      fetchWithDelay();

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }
  }, []);

  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar__logo">
        <NavLink to="/">
          <img src={logo} alt="logo" />
        </NavLink>
      </div>
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
                <span>{item.notification !== undefined && item.notification > 0 && ` (${item.notification})`}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;