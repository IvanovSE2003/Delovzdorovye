import { Link, useLocation } from 'react-router-dom';
import type { SidebarProps } from '../../../models/MenuItems';
import './Sidebar.scss';
import { RouteNames } from '../../../routes';
import logo from '../../../../public/logo.svg';

const Sidebar: React.FC<SidebarProps> = ({ menuItems, className = '' }) => {
  const location = useLocation();
  
  return (
    <div className={`sidebar ${className}`}>
      <Link to={RouteNames.MAIN}>
        <img className='sidebar__logo' src={logo} alt="logo" />
      </Link>
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems?.map((item, index) => (
            <li key={index} className={`sidebar__menu-item ${
              location.pathname === item.path ? 'sidebar__menu-item--active' : ''
            }`}>
              <Link
                to={item.path}
                className="sidebar__link"
              >
                <span className="sidebar__text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;