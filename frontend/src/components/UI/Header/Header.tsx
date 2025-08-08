import "./Header.scss";
import logo from "../../../assets/images/logo.png";
import avatar from "../../../assets/images/defaultImage.png";
import React, { useContext, useEffect } from "react";
import { Link } from "react-router";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";
import { RouteNames } from "../../../routes";

const Header: React.FC = () => {
  const { store } = useContext(Context);
  return (
    <>
      <div className="header">
        <Link to={RouteNames.MAIN}>
          <picture>
            <source />
            <img className="header__logo" src={logo} alt="logo_medonline" />
          </picture>
        </Link>
        <nav className="header__nav">
          <a href="#">Какие проблемы решаем?</a>
          <a href="#">Стоимость</a>
          <a href="#">Полезная информация</a>
          <a href="#">Контакты</a>
        </nav>
        <div className="header__profile">
          {store.isAuth
            ? 
            <div className="header__phone">
              {store.user.phone}
            </div>
            : 
            <Link to={RouteNames.LOGIN}>
              <button>Войти</button>
            </Link>
          }
          <div className="header__avatar">
            <Link to={RouteNames.PERSONAL}>
              <img src={avatar} alt="avatar" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default observer(Header);
