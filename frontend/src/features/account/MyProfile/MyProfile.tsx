import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main.js";
import { observer } from "mobx-react-lite";
import type { Gender, IUserDataProfile } from "../../../models/Auth.js";
import { useNavigate } from "react-router-dom";
import { RouteNames } from "../../../routes/index.js";

import "./MyProfile.scss";
import Loader from "../../../components/UI/Loader/Loader.js";
import UserAvatar from "../UserAvatar/UserAvatar.js";
import ProfileEditForm from "../ProfileEditForm/ProfileEditForm.js";
import UserInfo from "../UserInfo/UserInfo.js";
import UserActions from "../UserActions/UserActions.js";
import ProfileWarnings from "./components/ProfileWarnings.js";

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const { store } = useContext(Context);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [anonym, setAnonym] = useState<boolean>(store.user.isAnonymous);
  const [formData, setFormData] = useState<IUserDataProfile>({
    img: store.user.img,
    role: store.user.role,
    surname: store.user.surname,
    name: store.user.name,
    patronymic: store.user.patronymic,
    gender: store.user.gender,
    dateBirth: store.user.dateBirth,
    phone: store.user.phone,
    email: store.user.email,
    isAnonymous: store.user.isAnonymous,
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
          img: store.user.img
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
        img: store.user.img
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

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, dateBirth: date }))
  }

  const handleSave = async () => {
    // Если хоть одно поле пустое и нет флага "аноним", то ошибка
    console.log(formData);
    await store.updateUserData(formData, store.user.id);
    setIsEditing(false);
  };

  const handleGenderChange = (gender: Gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const GetFormatDate = (date: string) => {
    return date?.split('-').reverse().join('.');
  };

  const GetFormatPhone = (phone: string) => {
    return phone?.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
  };

  const Logout = async () => {
    await store.logout();
    navigate(RouteNames.MAIN);
  };

  useEffect(() => {
    store.user.isAnonymous
      ? setFormData(prev => ({
        ...prev,
        name: "",
        surname: "",
        patronymic: "",
        isAnonymous: anonym
      }))
      : setFormData(prev => ({
        ...prev,
        isAnonymous: anonym
      }));
  }, [anonym])

  useEffect(() => {
    console.log(formData)
  }, [formData]);

  if (store.loading) return <Loader />

  return (
    <div className="user-profile">

      <div className="user-profile__box">
        <div className="user-profile__content">
          <UserAvatar
            img={store.user.img}
            isEditing={isEditing}
            anonym={anonym}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />

          <div className="user-profile__info">
            {isEditing ? (
              <ProfileEditForm
                formData={formData}
                anonym={anonym}
                userRole={store.user.role}
                onInputChange={handleInputChange}
                onGenderChange={handleGenderChange}
                onDateChange={handleDateChange}
                onAnonymChange={() => setAnonym(prev => !prev)}
              />
            ) : (
              <UserInfo
                user={store.user}
                anonym={anonym}
                getFormatDate={GetFormatDate}
                getFormatPhone={GetFormatPhone}
              />
            )}

            <UserActions
              isEditing={isEditing}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              onEdit={() => setIsEditing(true)}
              onLogout={Logout}
            />
          </div>
        </div>

        <ProfileWarnings/>

      </div>
    </div>
  );
};

export default observer(MyProfile);