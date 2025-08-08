import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main.js";
import type { IUser } from "../../../models/Auth.js";
import { getTimeZoneLabel } from "../../../models/TimeZones.js";
import { useNavigate } from "react-router";
import { RouteNames } from "../../../routes/index.js";
import { observer } from "mobx-react-lite";


import avatar from "../../../assets/images/avatar.png";
import "./UserProfile.scss";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [dataUser, setDataUser] = useState<IUser>({} as IUser);
  const { store } = useContext(Context);

  useEffect(() => {
    if(store.isAuth) setDataUser(store.user);
  }, [store])

  const logout = () => {
    store.logout();
    navigate(RouteNames.MAIN);
  }

  return (
    <div className="user-profile">
      <div className="user-profile__avatar">
        <img src={avatar} alt="" />
      </div>

      <div className="user-profile__info">
        <div className='info-row'>
          <span className="info-label">Фамилия:</span>
          <span className="info-value">{dataUser.surname}</span>
        </div>

        <div className='info-row'>
          <span className="info-label">Имя:</span>
          <span className="info-value">{dataUser.name}</span>
        </div>

        <div className='info-row'>
          <span className="info-label">Отчество:</span>
          <span className="info-value">{dataUser.patronymic}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Пол:</span>
          <span className="info-value">{dataUser.gender}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Дата рождения:</span>
          <span className="info-value">{dataUser.dateBirth}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Часовой пояс:</span>
          <span className="info-value">{getTimeZoneLabel(dataUser.timeZone)}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Телефон: </span>
          <span className="info-value">{dataUser.phone}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Электронная почта: </span>
          <span className="info-value">{store.user.email}</span>
        </div>

        <button className="user-profile__edit-button">Редактировать</button>
        <button className="user-profile__edit-button" onClick={logout}>Выйти из аккаунта</button>
      </div>
    </div>
  );
};

export default observer(UserProfile);
