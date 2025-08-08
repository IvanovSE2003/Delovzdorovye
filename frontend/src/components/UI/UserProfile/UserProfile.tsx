import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main.js";
import type { IUser } from "../../../models/Auth.js";
import { getTimeZoneLabel, TimeZoneLabels } from "../../../models/TimeZones.js";
import { useNavigate } from "react-router";
import { RouteNames } from "../../../routes/index.js";
import { observer } from "mobx-react-lite";

import avatar from "../../../assets/images/avatar.png";
import "./UserProfile.scss";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [dataUser, setDataUser] = useState<IUser>({} as IUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<IUser>({} as IUser);
  const { store } = useContext(Context);

  useEffect(() => {
    if (store.isAuth) {
      console.log(store.user);
      setDataUser(store.user);
      setEditForm(store.user);
    }
  }, [store]);

  const logout = () => {
    store.logout();
    navigate(RouteNames.MAIN);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(dataUser);
  };

  const handleSave = async () => {
    try {
      // await store.updateUser(editForm);
      setDataUser(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const renderField = (label: string, name: keyof IUser, value: string) => {
    if (isEditing) {
      return (
        <div className='info-row'>
          <span className="info-label">{label}:</span>
          <input
            type="text"
            name={name}
            value={editForm.name || ''}
            onChange={handleChange}
            className="info-input"
          />
        </div>
      );
    }
    return (
      <div className='info-row'>
        <span className="info-label">{label}:</span>
        <span className="info-value">{value}</span>
      </div>
    );
  };

  return (
    <div className="user-profile">
      <div className="user-profile__avatar">
        <img src={avatar} alt="" />
      </div>

      <div className="user-profile__info">
        {renderField("Фамилия", "surname", dataUser.surname)}
        {renderField("Имя", "name", dataUser.name)}
        {renderField("Отчество", "patronymic", dataUser.patronymic || "")}
        {renderField("Пол", "gender", dataUser.gender)}
        {renderField("Дата рождения", "dateBirth", dataUser.dateBirth || "")}

        <div className="info-row">
          <span className="info-label">Часовой пояс:</span>
          {isEditing ? (
            <select
              name="timeZone"
              value={editForm.timeZone}
              onChange={(e) => setEditForm(prev => ({ ...prev, timeZone: Number(e.target.value) }))}
              className="info-input"
            >
              {Object.entries(TimeZoneLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <span className="info-value">{getTimeZoneLabel(dataUser.timeZone)}</span>
          )}
        </div>

        <div className="info-row">
          <span className="info-label"> Номер телефона: </span>
          <span className="info-value">{store.user.phone}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Электронная почта: </span>
          <span className="info-value">{store.user.email}</span>
        </div>

        {isEditing ? (
          <div className="user-profile__actions">
            <button className="auth__button" onClick={handleSave}>
              Сохранить
            </button>
            <button className="auth__button" onClick={handleCancel}>
              Отмена
            </button>
          </div>
        ) : (
          <>
            <button className="auth__button" onClick={handleEdit}>
              Редактировать
            </button>
            <button className="auth__button" onClick={logout}>
              Выйти из аккаунта
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default observer(UserProfile);