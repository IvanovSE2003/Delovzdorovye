import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main.js";
import { useNavigate } from "react-router";
import { RouteNames } from "../../../routes/index.js";
import { observer } from "mobx-react-lite";
import avatar from "../../../assets/images/defaultImage.png"
import { URL } from "../../../http";

import type { IUserDataProfile } from "../../../models/Auth.js";
import { getTimeZoneLabel, TimeZoneLabels } from "../../../models/TimeZones.js";
import "./UserProfile.scss";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(avatar);
  const [dataUser, setDataUser] = useState<IUserDataProfile>(
    {} as IUserDataProfile
  );
  const [editForm, setEditForm] = useState<IUserDataProfile>(
    {} as IUserDataProfile
  );
  const [isEditing, setIsEditing] = useState(false);

  const { store } = useContext(Context);

  // Получаем данные пользователя
  const getUserData = async () => {
    if (store.isAuth) {
      const user = await store.getUserData(store.user.id);
      setDataUser(user || ({} as IUserDataProfile));
      setEditForm(user || ({} as IUserDataProfile));
    }
  };
  useEffect(() => {
    getUserData();
  }, [store]);

  // Выходим из учетной записи
  const logout = () => {
    store.logout();
    navigate(RouteNames.MAIN);
  };

  // Выходим из режима редактирования
  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(dataUser);
  };

  // Сохраняем изменения редактирования
  const handleSave = async () => {
    try {
      console.log(editForm);
      // await store.updateUser(editForm);
      setDataUser(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
    }
  };

  // Добавляем изменения в форму
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Добавляем поле для редактирования
  const renderField = (
    label: string,
    name: keyof IUserDataProfile,
    value: string
  ) => {
    if (isEditing) {
      return (
        <div className="info-row">
          <span className="info-label">{label}:</span>
          <input
            type="text"
            name={name}
            value={editForm[name]}
            onChange={handleChange}
            className="info-input"
          />
        </div>
      );
    }
    return (
      <div className="info-row">
        <span className="info-label">{label}:</span>
        <span className="info-value">{value}</span>
      </div>
    );
  };

  // Добавляем новый аватар для пользователя
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEditForm((prev) => ({ ...prev, avatarFile: file }));
    }
  };

  return (
    <div className="user-profile">
      <h2 className="user-profile__title">
        {isEditing ? "Редактирование профиля" : "Ваш профиль"}
      </h2>

      <div className="user-profile__content">
        <div className="user-profile__content">
          <div className={`user-profile__avatar ${isEditing ? "editable" : ""}`}>
            <img
              src={avatarPreview}
              alt="Аватар пользователя"
              onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
            />
            {isEditing && (
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-edit__input"
                style={{ display: 'none' }}
              />
            )}
            {isEditing && <div className="avatar-edit-hint">Нажмите для изменения</div>}
          </div>
        </div>

        <div className="user-profile__info">
          {renderField("Фамилия", "surname", dataUser.surname)}
          {renderField("Имя", "name", dataUser.name)}
          {renderField("Отчество", "patronymic", dataUser.patronymic || "")}
          {renderField("Пол", "gender", dataUser.gender)}

          {/* Дата рождения */}
          <div className="info-row">
            <span className="info-label">Дата рождения:</span>
            {isEditing ? (
              <input
                type="date"
                name="dateBirth"
                className="info-input"
                value={editForm.dateBirth || ""}
                onChange={handleChange}
              />
            ) : (
              <span className="info-value">{store.user.dateBirth}</span>
            )}
          </div>

          {/* Часовой пояс */}
          <div className="info-row">
            <span className="info-label">Часовой пояс:</span>
            {isEditing ? (
              <select
                name="timeZone"
                value={editForm.timeZone}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    timeZone: Number(e.target.value),
                  }))
                }
                className="info-input"
              >
                {Object.entries(TimeZoneLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="info-value">
                {getTimeZoneLabel(dataUser.timeZone)}
              </span>
            )}
          </div>

          {/* Телефон */}
          <div className="info-row">
            <span className="info-label">Номер телефона: </span>
            <span className="info-value">{store.user.phone}</span>
          </div>

          {/* Почта */}
          <div className="info-row">
            <span className="info-label">Электронная почта: </span>
            <span className="info-value">{store.user.email}</span>
          </div>

          {isEditing ? (
            <div className="user-profile__actions">
              <button
                className="auth__button user-profile__edit-button"
                onClick={handleSave}
              >
                Сохранить
              </button>
              <button
                className="auth__button user-profile__exit-button"
                onClick={handleCancel}
              >
                Отмена
              </button>
            </div>
          ) : (
            <>
              <button
                className="auth__button user-profile__edit-button"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </button>
              <button
                className="auth__button user-profile__exit-button"
                onClick={logout}
              >
                Выйти из аккаунта
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default observer(UserProfile);