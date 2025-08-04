import "./Header.scss";
import logo from "../../../assets/images/logo.png";
import avatar from "../../../assets/images/avatar.png";
import React, { useContext, useEffect } from "react";
import { Link } from "react-router";
import { Context } from "../../../main";
import { observer } from "mobx-react-lite";

const Header: React.FC = () => {
  const { store } = useContext(Context);
  return (
    <>
      <div className="header">
        <Link to="/">
          <img className="header__logo" src={logo} alt="logo_medonline" />
        </Link>
        <nav className="header__nav">
          <a href="#">Решаемые проблемы</a>
          <a href="#">Запись на консультацию</a>
          <a href="#">Полезная информация</a>
          <a href="#">Контакты</a>
          <a href="#">Цены</a>
        </nav>
        <div className="header__profile">
          {store.isAuth ? (
            <>
              <button onClick={async () => await store.logout()}>Выйти</button>
              <Link to="/personal">
                <img src={avatar} alt="avatar" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/register">
                <button>Войти</button>
              </Link>
              <Link to="/register">
                <img src={avatar} alt="avatar" />
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default observer(Header);
