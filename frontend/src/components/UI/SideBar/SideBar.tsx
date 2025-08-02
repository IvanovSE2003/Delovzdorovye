import React from 'react';
import { Link } from 'react-router';
import logo from '../../../assets/images/logo.png'
import { 
  HomeOutlined, 
  CommentOutlined, 
  MessageOutlined, 
  CalendarOutlined, 
  GiftOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';
import './Sidebar.scss';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Главная', path: '/', icon: <HomeOutlined /> },
    { name: 'Консультации', path: '/consultations', icon: <CommentOutlined /> },
    { name: 'Сообщения', path: '/messages', icon: <MessageOutlined /> },
    { name: 'Назначения', path: '/appointments', icon: <CalendarOutlined /> },
    { name: 'Бонусы', path: '/bonuses', icon: <GiftOutlined /> },
    { name: 'Полезная информация', path: '/info', icon: <InfoCircleOutlined /> },
  ];

  return (
    <div className="sidebar">
        <Link to="/">
          <img className='sidebar__logo' src={logo} alt="logo_medonline" />
        </Link>
        <nav>
            <ul className="sidebar__menu">
              {menuItems.map((item, index) => (
                  <li key={index} className="sidebar__menu-item">
                    <Link to={item.path} className="sidebar__link">
                        <span className="sidebar__icon">{item.icon}</span>
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