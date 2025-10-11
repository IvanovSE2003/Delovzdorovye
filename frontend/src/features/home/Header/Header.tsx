import { Link } from "react-router";

import avatar from "../../../assets/images/account.png"
import logo from "@/assets/images/logo.svg";
import "./Header.scss";
import { useEffect, useState } from "react";
import HomeService from "../../../services/HomeService";
import { GetFormatPhone } from "../../../helpers/formatDatePhone";
import { defaultRoleRoutes, RouteNames } from "../../../routes";
import type { Role } from "../../../models/Auth";
import ContentLoader from "react-content-loader";
import { processError } from "../../../helpers/processError";

interface headerProps {
  isAuth: boolean;
  role: Role;
}

const Header: React.FC<headerProps> = ({ isAuth, role }) => {
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Получение данных
  const fetchPhone = async () => {
    try {
      setLoading(true);
      const response = await HomeService.getContent("phone");
      setPhone(response.data.contents[0].text);
    } catch (e) {
      processError(e, "Ошибка при получении номера телефона");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPhone();
  }, [])

  // Переход на страницу при нажатии на иконку личного кабинета
  const startPage =
    isAuth
      ? defaultRoleRoutes[role] || RouteNames.PERSONAL
      : RouteNames.LOGIN;


  return (
    <div className="header">

      <Link to={RouteNames.HOME}>
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

        {phone && !loading && (
          <div className="header__phone">
            <a href={`tel:${phone}`}>{GetFormatPhone(phone)}</a>
          </div>
        )}

        {phone && loading && (
          <ContentLoader
            speed={2}
            width={202}
            height={30}
            viewBox="0 0 202 30"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="0" rx="11" ry="11" width="202" height="30" />
          </ContentLoader>
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
