import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main.js";
import { useNavigate } from "react-router";
import { RouteNames } from "../../../routes/index.js";
import { observer } from "mobx-react-lite";
import avatar from "../../../assets/images/defaultImage.png"

import type { Gender, IUserDataProfile } from "../../../models/Auth.js";
import { getTimeZoneLabel, TimeZoneLabels } from "../../../models/TimeZones.js";
import "./UserProfile.scss";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [avatarPreview, setAvatarPreview] = useState(avatar);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dataUser, setDataUser] = useState<IUserDataProfile>({} as IUserDataProfile);
  const [editForm, setEditForm] = useState<IUserDataProfile>({} as IUserDataProfile);
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
    const data = await store.updateUserData(editForm, store.user.id);
    setMessage(data.message);
    setDataUser(editForm);
    setIsEditing(false);
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

  // Отправить сообщение с активацией почты
  // const sendAcitvate = async () => {
  //   const data = await store.sendActivate();
  //   data.success
  //     ? setMessage(data.message)
  //     : setError(data.message);
  // }

  return (
    <div className="user-profile">
      <h3 className="user-profile__error">{error}</h3>
      <h3 className="user-profile__message">{message}</h3>

      <h2 className="user-profile__title">
        {isEditing ? "Редактирование профиля" : "Ваш профиль"}
      </h2>

      <div className="user-profile__content">
        <div className="user-profile__content">
          <div>
            <div
              className={`user-profile__avatar ${isEditing ? "editable" : ""}`}
              onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
            >
              <img
                src={avatarPreview}
                alt="Аватар пользователя"
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
            </div>
            {isEditing && <div className="avatar-edit-hint">Нажмите для изменения</div>}
          </div>
        </div>

        <div className="user-profile__info">
          {renderField("Фамилия", "surname", dataUser.surname)}
          {renderField("Имя", "name", dataUser.name)}
          {renderField("Отчество", "patronymic", dataUser.patronymic || "")}

          {/* Пол */}
          <div className="info-row">
            <span className="info-label">Пол:</span>
            {isEditing ? (
              <select
                name="gender"
                value={editForm.gender}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    gender: e.target.value as Gender,
                  }))
                }
                className="info-input"
              >
                <option value="" disabled>Выберите пол</option>
                <option value="мужчина">Мужчина</option>
                <option value="женщина">Женщина</option>
              </select>
            ) : (
              <span className="info-value">{dataUser.gender}</span>
            )}
          </div>

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
              <span className="info-value">{dataUser.dateBirth}</span>
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
            <span className="info-value">
              {store.user.email}
            </span>
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
      <div className="solutions__warm">
        <span>
          Вход в аккаунт доступен только по почте! Чтобы входить по телефону необходимо <a href="/">подключиться к телеграмм-боту</a>.
        </span>
      </div>
    </div>
  );
};

export default observer(UserProfile);