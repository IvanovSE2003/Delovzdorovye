import { useContext, useState } from "react";
import { Context } from "../../../main.js";
import { observer } from "mobx-react-lite";
import type { Gender, IUserDataProfile } from "../../../models/Auth.js";
import { useNavigate } from "react-router-dom";
import { RouteNames } from "../../../routes/index.js";
import { URL } from "../../../http/index.js";

import "./UserProfile.scss";
import QRcodeImg from '../../../assets/images/qr_code.png';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { store } = useContext(Context);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [QRcode, setQRcode] = useState<boolean>(false);
  const [QRtoken, setQRtoken] = useState<string>("Тут должен быть токен");

  const [formData, setFormData] = useState<IUserDataProfile>({
    img: `${URL}/${store.user.img}`,
    surname: store.user.surname,
    name: store.user.name,
    patronymic: store.user.patronymic,
    gender: store.user.gender,
    dateBirth: store.user.dateBirth,
    phone: store.user.phone,
    email: store.user.email
  });

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append('img', file);
      formData.append('userId', store.user.id.toString());

      try {
        await store.uploadAvatar(formData);

        setFormData(prev => ({
          ...prev,
          img: `${URL}/${store.user.img}`
        }));

      } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await store.removeAvatar(store.user.id);
      setFormData(prev => ({
        ...prev,
        img: `${URL}/${store.user.img}`
      }));

    } catch (error) {
      console.error('Ошибка удаления изображения:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    console.log('formData ', formData);
    const data = await store.updateUserData(formData, store.user.id);
    console.log(data);
    setIsEditing(false);
  };

  const openQR = async () => {
    const data = await store.getTokenTg(store.user.id);
    if (data.success) {
      setQRtoken(data.token);
      setQRcode(true);
    } else {
      console.log("Error");
    }
  };

  const handleGenderChange = (gender: Gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const GetFormatDate = (date: string) => {
    return date.split('-').reverse().join('.');
  };

  const GetFormatPhone = (phone: string) => {
    return phone.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
  };

  const Logout = async () => {
    await store.logout();
    navigate(RouteNames.MAIN);
  };

  return (
    <div className="user-profile">
      <div className="user-profile__box">
        <div className="user-profile__content">
          <div className="user-profile__avatar-content">
            <div className="user-profile__avatar">
              <img src={formData.img} alt="avatar-delovzdorovye" />
            </div>
            {isEditing && (
              <div className="user-profile__links">
                <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                  <p>Добавить фото</p>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAddPhoto}
                  />
                </label>
                <p onClick={handleRemovePhoto}>Удалить фото</p>
              </div>
            )}
          </div>

          <div className="user-profile__info">
            {isEditing ? (
              <div className="user-profile__edit-form">
                <div className="form-group">
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    placeholder="Фамилия"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Имя"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="patronymic"
                    value={formData.patronymic || ""}
                    onChange={handleInputChange}
                    placeholder="Отчество"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '4px 0' }}>
                  <div className="auth__radio-btn">
                    <input
                      id="male"
                      type="radio"
                      name="gender"
                      value="мужчина"
                      checked={formData.gender === "Мужчина"}
                      onChange={() => handleGenderChange("Мужчина")}
                    />
                    <label htmlFor="male">Мужчина</label>
                  </div>

                  <div className="auth__radio-btn">
                    <input
                      id="female"
                      type="radio"
                      name="gender"
                      value="женщина"
                      checked={formData.gender === "Женщина"}
                      onChange={() => handleGenderChange("Женщина")}
                    />
                    <label htmlFor="female">Женщина</label>
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="date"
                    name="dateBirth"
                    value={formData.dateBirth}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Номер телефона"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="user-profile__fio">
                  {store.user.surname} {store.user.name} {store.user.patronymic}
                </div>

                <div className="user-profile__main-info">
                  <span>Пол: {formData.gender}</span>
                  <span>Дата рождения: {GetFormatDate(formData.dateBirth)}</span>
                  <span>Номер телефона: {GetFormatPhone(formData.phone)}</span>
                  <span>E-mail: {formData.email}</span>
                </div>
              </>
            )}

            <div className="user-profile__buttons">
              {isEditing ? (
                <>
                  <button className="button" onClick={handleSave}>Сохранить</button>
                  <button className="button" onClick={() => setIsEditing(false)}>Отмена</button>
                </>
              ) : (
                <>
                  <button className="button" onClick={() => setIsEditing(true)}>Редактировать</button>
                  <button className="button" onClick={Logout}>Выйти из аккаунта</button>
                </>
              )}
            </div>
          </div>
        </div>
        {!store.user.isActivatedSMS && (
          <div className="user-profile__warn">
            <span>Вход доступен только через электронную почту. Чтобы выходить через телефон, его надо
              <a onClick={openQR}> подключить к телеграмм-боту.</a>
            </span>
          </div>
        )}
      </div>
      {QRcode && (
        <div className="QRcode">
          <div className="QRcode__box">
            <img src={QRcodeImg} alt="QR-code tg" />
            <p className="QRcode__token">{QRtoken}</p>
            <p className="QRcode__description">Ваш токен для подключения</p>
            <a className="QRcode__close" onClick={() => setQRcode(false)}>Скрыть</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(UserProfile);