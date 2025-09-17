import { RouteNames } from "../../../routes";
import { Link } from "react-router";

import avatar from "../../../assets/images/account.png"
import logo from "../../../../public/logo.svg";
import "./Header.scss";

interface headerProps {
  isAuth: boolean;
}

const Header: React.FC<headerProps> = ({ isAuth }) => {
  return (

    <div className="header">
      <Link to={RouteNames.MAIN}>
        <picture>
          <source />
          <img className="header__logo" src={logo} alt="logo_medonline" />
        </picture>
      </Link>
      <nav className="header__nav">
        <a href="#solutions">Какие проблемы решаем?</a>
        <a href="#costs">Стоимость</a>
        <a href="#informations">Полезная информация</a>
        <a href="#contacts">Контакты</a>
      </nav>
      <div className="header__profile">
        <div className="header__phone">
          <a href="tel:88888888888">8 888 888 88 88</a>
        </div>
        {isAuth
          ?
          <div className="header__avatar">
            <Link to={RouteNames.PERSONAL}>
              <img src={avatar} alt="avatar" />
            </Link>
          </div>
          :
          <div className="header__avatar">
            <Link to={RouteNames.LOGIN}>
              <img src={avatar} alt="avatar" />
            </Link>
          </div>
        }
      </div>
    </div>

  );
};

export default Header;
