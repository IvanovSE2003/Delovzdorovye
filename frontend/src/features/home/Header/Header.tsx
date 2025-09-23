import { Link } from "react-router";

import avatar from "../../../assets/images/account.png"
import logo from "@/assets/images/logo.svg";
import "./Header.scss";
import { useEffect, useState } from "react";
import HomeService from "../../../services/HomeService";
import { GetFormatPhone } from "../../../helpers/formatDatePhone";
import { defaultRoleRoutes, RouteNames } from "../../../routes";
import type { Role } from "../../../models/Auth";

interface headerProps {
  isAuth: boolean;
  role: Role;
}

const Header: React.FC<headerProps> = ({ isAuth, role}) => {
  const [phone, setPhone] = useState<string>("");

  // Получение данных
  const fetchPhone = async () => {
    try {
      const response = await HomeService.getContent("phone");
      setPhone(response.data.contents[0].text);
    } catch (e) {
      console.error("Ошибка при получении номера телефона: ", e)
    }
  }

  // Получение данных при загрузке блока
  useEffect(() => {
    fetchPhone();
  }, [])

  const startPage =
    isAuth
      ? defaultRoleRoutes[role] || RouteNames.PERSONAL
      : RouteNames.LOGIN;

  // Основной рендер
  return (
    <div className="header">

      <Link to={RouteNames.MAIN}>
        <picture>
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

        {phone && (
          <div className="header__phone">
            <a href={`tel:${phone}`}>{GetFormatPhone(phone)}</a>
          </div>
        )}

        <div className="header__avatar">
          <Link to={startPage}>
            <img src={avatar} alt="avatar" />
          </Link>
        </div>

      </div>
    </div>

  );
};

export default Header;
