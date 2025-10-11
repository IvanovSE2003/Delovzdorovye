import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main.js";
import { observer } from "mobx-react-lite";
import Loader from "../../../components/UI/Loader/Loader.js";
import ProfileWarnings from "./components/ProfileWarnings.js";
import UserProfile from "./UserProfile.js";
import UserProfileEdit from "./UserProfileEdit.js";
import type { IUserDataProfileEdit } from "../../../models/Auth.js";
import AccountLayout from "../../../pages/account/AccountLayout.js";
import DoctorInfo from "../DoctorInfo/DoctorInfo.js";
import "./MyProfile.scss";
import ShowError from "../../../components/UI/ShowError/ShowError.js";

const MyProfile: React.FC = () => {
    const { store } = useContext(Context);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [error, setError] = useState<{id: number; message: string}>({id: 0, message: ""});
    const [message, setMessage] = useState<{id: number; message: string}>({id: 0, message: ""});

    // Добавление фотографии
    const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>, changePhoto: (img: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            const formData = new FormData();
            formData.append('img', file);
            formData.append('userId', store.user.id.toString());

            await store.uploadAvatar(formData);
            changePhoto(store.user.img)
        }
    };

    // Удаление фотографии
    const handleRemovePhoto = async (changePhoto: (img: string) => void) => {
        await store.removeAvatar(store.user.id);
        changePhoto(store.user.img);
    };

    // Сохранение изменений
    const handleSave = async (ProfileData: IUserDataProfileEdit) => {
        setError({id: Date.now(), message: ""});
        const data = await store.updateUserData(ProfileData, store.user.id);
        if (data.success) {
            setIsEditing(false);
            setMessage({id: Date.now(), message: data.message})
        }
        else {
            setError({id: Date.now(), message: data.message});
        }
    };

    useEffect(() => {
        setError({id: Date.now(), message: ""});
    }, [isEditing])

    if (store.loading) return (
        <AccountLayout>
            <Loader />
        </AccountLayout>
    )

    return (
        <AccountLayout>
            <div className="user-profile">
                {isEditing && <div className="user-profile__title">Вы находитесь в режиме редактирования профиля</div>}
                <ShowError msg={error} className="user-profile__error"/>
                <ShowError msg={message} mode="MESSAGE" className="user-profile__error"/>
                <div className="user-profile__box">
                    <div className={store.user.role !== "ADMIN" ? "user-profile__content" : "user-profile__admin"}>
                        {isEditing ? (
                            <UserProfileEdit
                                profileData={store.user}
                                onAddPhoto={handleAddPhoto}
                                onRemovePhoto={handleRemovePhoto}
                                onSave={handleSave}
                                onCancel={() => setIsEditing(false)}
                                role={store.user.role}
                            />
                        ) : (
                            <UserProfile
                                profileData={store.user}
                                onEdit={() => setIsEditing(true)}
                                onLogout={async () => await store.logout()}
                                mode="OWN"
                            />
                        )}
                    </div>
                    <ProfileWarnings />
                </div>
            </div>

            {store.user.role === "DOCTOR" && (
                <DoctorInfo
                    type="WRITE"
                    userId={store.user.id}
                />
            )}
        </AccountLayout>
    );
};

export default observer(MyProfile);