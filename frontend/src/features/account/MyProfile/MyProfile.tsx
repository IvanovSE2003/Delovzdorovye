import { useContext, useEffect, useState } from "react";
import { Context } from "../../../main.js";
import { observer } from "mobx-react-lite";
import Loader from "../../../components/UI/Loader/Loader.js";
import ProfileWarnings from "./components/ProfileWarnings.js";
import UserProfile from "./UserProfile.js";
import UserProfileEdit from "./UserProfileEdit.js";
import type { IUserDataProfile } from "../../../models/Auth.js";
import AccountLayout from "../../../pages/account/AccountLayout.js";
import DoctorInfo from "../DoctorInfo/DoctorInfo.js";
import "./MyProfile.scss";

const MyProfile: React.FC = () => {
    const { store } = useContext(Context);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // Добавление фотографии
    const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>, changePhoto: (img: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            const formData = new FormData();
            formData.append('img', file);
            formData.append('userId', store.user.id.toString());

            try {
                await store.uploadAvatar(formData);
                changePhoto(store.user.img)
            } catch (error) {
                console.error('Ошибка загрузки изображения:', error);
            }
        }
    };

    // Удаление фотографии
    const handleRemovePhoto = async (changePhoto: (img: string) => void) => {
        try {
            await store.removeAvatar(store.user.id);
            changePhoto(store.user.img);
        } catch (error) {
            console.error('Ошибка удаления изображения:', error);
        }
    };

    // Сохранение изменений
    const handleSave = async (ProfileData: IUserDataProfile) => {
        setError("");
        const data = await store.updateUserData(ProfileData, store.user.id);
        if (data.success) setIsEditing(false);
        else setError(data.message);
    };

    useEffect(() => {
        setError("");
    }, [isEditing])

    if (store.loading) return (
        <AccountLayout>
            <Loader />
        </AccountLayout>
    )

    return (
        <AccountLayout>
            <div className="user-profile">
                {error && (<div className="user-profile__error">{error}</div>)}
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