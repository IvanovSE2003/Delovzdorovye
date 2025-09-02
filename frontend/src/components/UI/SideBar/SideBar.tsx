import type { SidebarProps } from '../../../models/MenuItems';
import './Sidebar.scss';
import { NavLink, useLocation } from "react-router-dom";

const Sidebar: React.FC<SidebarProps> = ({ menuItems, className = '' }) => {
  const location = useLocation();
  const lastMenu = localStorage.getItem("lastMenu");

  // функция, которая проверяет, относится ли путь к разделу
  const isPathRelatedToMenu = (menuPath: string, currentPath: string) => {
    // пример: для "Запись на консультацию" включаем profile/:id
    if (menuPath === '/make-consultation') {
      return currentPath.startsWith('/make-consultation') || currentPath.startsWith('/profile/');
    }
    // здесь можно добавить другие исключения для других разделов
    return currentPath.startsWith(menuPath);
  };

  // определяем активный пункт меню
  const activePath =
    menuItems.find(item => isPathRelatedToMenu(item.path, location.pathname))
      ?.path || lastMenu;

  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar__logo">
        <NavLink to="/">
          <img src="/logo.svg" alt="logo" />
        </NavLink>
      </div>
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems?.map((item, index) => (
            <li key={index} className="sidebar__menu-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${(isActive || activePath === item.path) ? 'active' : ''}`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
