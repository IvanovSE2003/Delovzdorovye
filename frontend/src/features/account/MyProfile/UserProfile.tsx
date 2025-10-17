import type { IUserDataProfile, Role } from "../../../models/Auth";
import { GetFormatDate } from "../../../helpers/formatDate";
import { GetFormatPhone } from '../../../helpers/formatPhone';
import { URL } from "../../../http";
import { getTimeZoneLabel } from "../../../models/TimeZones";
import LoaderUsefulInfo from "../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";

interface UserProfileProps {
    profileData: IUserDataProfile;
    isAvatar?: boolean;
    isButton?: boolean;
    onEdit?: () => void;
    onLogout?: () => void;
    mode: "OWN" | "SOME";
}

const UserProfile: React.FC<UserProfileProps> = ({
    profileData,
    isAvatar = true,
    isButton = true,
    onEdit,
    onLogout,
    mode
}) => {
    if (!profileData) return <LoaderUsefulInfo />;

    const renderFullName = () => {
        if (profileData.isAnonymous) {
            return 'Анонимный пользователь';
        }

        if (mode === "OWN") {
            return `${profileData.pending_surname || ''} ${profileData.pending_name || ''} ${profileData.pending_patronymic || ''}`.trim();
        } else {
            return `${profileData.surname || ''} ${profileData.name || ''} ${profileData.patronymic || ''}`.trim();
        }
    };

    const renderGenderAndBirth = () => {
        if (profileData.isAnonymous) return null;

        const gender = mode === "OWN" ? profileData.pending_gender : profileData.gender;
        const dateBirth = mode === "OWN" ? profileData.pending_date_birth : profileData.dateBirth;

        return (
            <>
                {gender && (
                    <span>
                        <span className="label">Пол:</span> {gender}
                    </span>
                )}
                {dateBirth && (
                    <span>
                        <span className="label">Дата рождения:</span> {GetFormatDate(dateBirth)}
                    </span>
                )}
            </>
        );
    };

    const getRoleLabel = (role: Role) => {
        const roleLabels = {
            PATIENT: "Пользователь",
            DOCTOR: "Специалист",
            ADMIN: "Администратор"
        };
        return roleLabels[role] || role;
    };

    return (
        <>
            {isAvatar && profileData.role !== "ADMIN" && (
                <div className="user-profile__avatar-content">
                    <div className="user-profile__avatar">
                        <img
                            src={`${URL}/${mode === "OWN" ? profileData.pending_img : profileData.img}`}
                            alt="Аватар пользователя"
                        />
                    </div>
                </div>
            )}

            <div className="user-profile__main-info">
                <div className="user-profile__fio">
                    {renderFullName()}
                    {profileData.role && (
                        <div className="user-profile__role">
                            {getRoleLabel(profileData.role)}
                        </div>
                    )}
                </div>

                {!profileData.isAnonymous && (
                    <>
                        {renderGenderAndBirth()}
                        {profileData.age && (
                            <span>
                                <span className="label">Возраст:</span> {profileData.age}
                            </span>
                        )}
                    </>
                )}

                {profileData.phone && (
                    <span>
                        <span className="label">Номер телефона:</span> {GetFormatPhone(profileData.phone)}
                    </span>
                )}

                {profileData.email && (
                    <span>
                        <span className="label">E-mail:</span> {profileData.email}
                    </span>
                )}

                {profileData.timeZone && (
                    <span>
                        <span className="label">Часовой пояс:</span> {getTimeZoneLabel(profileData.timeZone)}
                    </span>
                )}

                {isButton && (
                    <div className="user-profile__buttons">
                        <button className="my-button width100" onClick={onEdit}>
                            Редактировать
                        </button>
                        <button className="neg-button width100" onClick={onLogout}>
                            Выйти из аккаунта
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default UserProfile;