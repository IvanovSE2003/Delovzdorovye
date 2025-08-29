import { useContext, useState } from "react";
import { Context } from "../../../main.js";
import { observer } from "mobx-react-lite";

import "./MyProfile.scss";
import Loader from "../../../components/UI/Loader/Loader.js";
import ProfileWarnings from "./components/ProfileWarnings.js";
import UserProfile from "./UserProfile.js";
import UserProfileEdit from "./UserProfileEdit.js";
import type { IUserDataProfile } from "../../../models/Auth.js";

const MyProfile: React.FC = () => {
    const { store } = useContext(Context);
    const [isEditing, setIsEditing] = useState<boolean>(false);

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

    const handleRemovePhoto = async (changePhoto: (img: string) => void) => {
        try {
            await store.removeAvatar(store.user.id);
            changePhoto(store.user.img);
        } catch (error) {
            console.error('Ошибка удаления изображения:', error);
        }
    };

    const handleSave = async (ProfileData: IUserDataProfile) => {
        console.log(ProfileData)
        const data = await store.updateUserData(ProfileData, store.user.id);
        if (data.success) setIsEditing(false);
    };

    const Logout = async () => {
        await store.logout();
    };

    if (store.loading) return <Loader />

    return (
        <div className="user-profile">
            <div className="user-profile__box">
                <div className="user-profile__content">
                    {isEditing ? (
                        <UserProfileEdit
                            profileData={store.user}
                            onAddPhoto={handleAddPhoto}
                            onRemovePhoto={handleRemovePhoto}
                            onSave={handleSave}
                            onCancel={() => setIsEditing(false)}
                        />
                    ) : (
                        <UserProfile
                            profileData={store.user}
                            onEdit={() => setIsEditing(true)}
                            onLogout={Logout}
                        />
                    )}
                </div>
                <ProfileWarnings />
            </div>
        </div>
    );
};

export default observer(MyProfile);