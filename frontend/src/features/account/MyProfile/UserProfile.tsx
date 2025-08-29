import type { IUserDataProfile } from "../../../models/Auth";
import { GetFormatDate, GetFormatPhone } from "../../../hooks/UserProfileHooks";
import { URL } from "../../../http";


interface UserProfileProps {
    profileData: IUserDataProfile;
    isAvatar?: boolean;
    isButton?: boolean;
    onEdit?: () => void;
    onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profileData, isAvatar = true, isButton = true, onEdit, onLogout }) => {
    return (
        <>
            {isAvatar && (
                <div className="user-profile__avatar-content">
                    <div className="user-profile__avatar">
                        <img src={`${URL}/${profileData.img}`} alt="avatar-delovzdorovye" />
                    </div>
                </div>
            )}

            <div className="user-profile__main-info">
                <div className="user-profile__fio">
                    {profileData.isAnonymous
                        ? 'Анонимный пользователь'
                        : <>{profileData.surname} {profileData.name} {profileData.patronymic}</>
                    }
                </div>

                {!profileData.isAnonymous && (
                    <>
                        <span><span className="label">Пол:</span> {profileData.gender}</span>
                        <span><span className="label">Дата рождения:</span> {GetFormatDate(profileData.dateBirth)}</span>
                        {profileData.age && (<span><span className="label">Возвраст</span> {profileData?.age} </span>)}
                    </>
                )}
                <span><span className="label">Номер телефона:</span> {GetFormatPhone(profileData.phone)}</span>
                <span><span className="label">E-mail:</span> {profileData.email}</span>

                {isButton && (
                    <div className="user-profile__buttons">
                        <button className="my-button width100" onClick={onEdit}>Редактировать</button>
                        <button className="neg-button width100" onClick={onLogout}>Выйти из аккаунта</button>
                    </div>
                )}
            </div>
        </>
    )
}

export default UserProfile;