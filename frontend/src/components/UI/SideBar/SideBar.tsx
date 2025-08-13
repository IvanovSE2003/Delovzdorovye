import React from 'react';
import { Link } from 'react-router';
import logo from '../../../assets/images/logo.png'
import './Sidebar.scss';
import { RouteNames } from '../../../routes';

const Sidebar: React.FC = () => {
  const menuItems = [
    { path: RouteNames.MAIN, name: 'Главная' },
    { path: RouteNames.MAIN, name: 'Консультации' },
    { path: RouteNames.MAIN, name: 'Рекомендации' },
    { path: RouteNames.MAIN, name: 'Полезная информация' },
  ]


  return (
    <div className="sidebar">
      <Link to={RouteNames.MAIN}>
        <div className="sidebar__logo">
          <img src={logo} alt="logo_medonline" />
        </div>
      </Link>
      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item, index) => (
            <li key={index} className="sidebar__menu-item">
              <Link to={item.path} className="sidebar__link">
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