import React, { useContext, useEffect, useState } from "react";
import avatar from "../../../assets/images/avatar.png";
// import type { IUser } from '../../../models/IUser.js';
import { Context } from "../../../main.js";
import "./UserProfile.scss";

interface IUser {
  id: number;
  email: string;
  isActivated: boolean;
}

const UserProfile: React.FC = () => {
  const [dataUser, setDataUser] = useState<IUser>({} as IUser);
  const { store } = useContext(Context);

  useEffect(() => {
    console.log(store.user.email);
  }, []);

  return (
    <div className="user-profile">
      <div className="user-profile__avatar">
        <img src={avatar} alt="" />
      </div>

      <div className="user-profile__info">
        {/* <div className='info-row'>
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
                    <span className="info-value">{dataUser.date_birth}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">Часовой пояс:</span>
                    <span className="info-value">{dataUser.time_zone}</span>
                </div>

                <div className="info-row">
                    <span className="info-label">Телефон: </span>
                    <span className="info-value">{dataUser.phone}</span>
                </div> */}

        <div className="info-row">
          <span className="info-label">Email: </span>
          <span className="info-value">{store.user.email}</span>
        </div>

        <button className="user-profile__edit-button">Редактировать</button>
      </div>
    </div>
  );
};

export default UserProfile;
