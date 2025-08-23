import { Link, useLocation } from 'react-router-dom';
import type { SidebarProps } from '../../../models/MenuItems';
import './Sidebar.scss';
import { RouteNames } from '../../../routes';
import logo from '../../../../public/logo.svg';

const Sidebar: React.FC<SidebarProps> = ({ menuItems, className = '' }) => {
  const location = useLocation();
  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar__logo">
        <Link to={RouteNames.MAIN}>
          <img src={logo} alt="logo" />
        </Link>
      </div>
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems?.map((item, index) => (
            <li key={index} className={`sidebar__menu-item ${location.pathname === item.path ? 'sidebar__menu-item--active' : ''
              }`}>
              <Link
                to={item.path}
                className="sidebar__link"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;