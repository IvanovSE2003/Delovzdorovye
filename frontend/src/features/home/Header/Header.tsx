import { RouteNames } from "../../../routes";
import { Link } from "react-router";

import avatar from "../../../assets/images/account.png"
import logo from "../../../../public/logo.svg";
import "./Header.scss";
import { useEffect, useState } from "react";
import HomeService from "../../../services/HomeService";
import { GetFormatPhone } from "../../../helpers/formatDatePhone";

interface headerProps {
  isAuth: boolean;
}

const Header: React.FC<headerProps> = ({ isAuth }) => {
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
          <Link to={isAuth ? RouteNames.PERSONAL : RouteNames.LOGIN}>
            <img src={avatar} alt="avatar" />
          </Link>
        </div>

      </div>
    </div>

  );
};

export default Header;
