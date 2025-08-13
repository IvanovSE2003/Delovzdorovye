import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main.js";
import { observer } from "mobx-react-lite";
import girl from '../../../assets/images/girl.png';
import man from '../../../assets/images/man.png';
import "./UserProfile.scss";

const UserProfile: React.FC = () => {
  const GetFormatDate = (date: string) => {
    return date.split('-').reverse().join('.');
  }

  const GetFormatPhone = (phone: string) => {
    return phone.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
  }

  const { store } = useContext(Context);
  const [avatar, setAvatar] = useState(man);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    surname: store.user.surname,
    name: store.user.name,
    patronymic: store.user.patronymic,
    gender: store.user.gender,
    dateBirth: GetFormatDate(store.user.dateBirth),
    phone: GetFormatPhone(store.user.phone),
    email: store.user.email
  });

  useEffect(() => {
    setAvatar(store.user.gender === 'женщина' ? girl : man);
  }, [store.user.gender]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Здесь можно добавить логику сохранения данных
    // Например: store.updateUserProfile(formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    store.logout();
  };

  return (
    <div className="user-profile">
      <div className="user-profile__content">
        <div className="user-profile__avatar-content">
          <div className="user-profile__avatar">
            <img src={avatar} alt="avatar-delovzdorovye" />
          </div>
          {isEditing && (
            <div className="user-profile__links">
              <p>Добавить фото</p>
              <p>Удалить фото</p>
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
                    name="male"
                    value="мужчина"
                    checked={formData.gender === "мужчина"}
                  />
                  <label htmlFor="male">Мужчина</label>
                </div>

                <div className="auth__radio-btn">
                  <input
                    id="female"
                    type="radio"
                    name="female"
                    value="женщина"
                    checked={formData.gender === "женщина"}
                  />
                  <label htmlFor="female">Женщина</label>
                </div>
              </div>

              <div className="form-group">
                <input
                  type="date"
                  name="dateBirth"
                  value={formData.dateBirth || '"'}
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
                <span>Номер телефона: {formData.phone}</span>
                <span>E-mail: {formData.email}</span>
              </div>
            </>
          )}

          <div className="user-profile__buttons">
            {isEditing ? (
              <>
                <button className="auth__button" onClick={handleSave}>Сохранить</button>
                <button className="auth__button" onClick={() => setIsEditing(false)}>Отмена</button>
              </>
            ) : (
              <>
                <button className="auth__button" onClick={() => setIsEditing(true)}>Редактировать</button>
                <button className="auth__button" onClick={handleLogout}>Выйти из аккаунта</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(UserProfile);